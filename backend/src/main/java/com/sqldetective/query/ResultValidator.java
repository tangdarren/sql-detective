package com.sqldetective.query;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import org.springframework.stereotype.Component;

@Component
public class ResultValidator {

    enum Outcome {
        CORRECT,
        WRONG_COLUMNS,
        WRONG_DATA
    }

    Outcome validate(QueryResult actual, QueryResult expected, boolean orderSensitive) {
        List<String> actualColumns = normalizeColumns(actual.columns());
        List<String> expectedColumns = normalizeColumns(expected.columns());

        if (!actualColumns.equals(expectedColumns)) {
            return Outcome.WRONG_COLUMNS;
        }

        List<List<String>> actualRows = normalizeRows(actual, actualColumns);
        List<List<String>> expectedRows = normalizeRows(expected, expectedColumns);

        if (!orderSensitive) {
            actualRows.sort(rowComparator());
            expectedRows.sort(rowComparator());
        }

        return actualRows.equals(expectedRows) ? Outcome.CORRECT : Outcome.WRONG_DATA;
    }

    private List<String> normalizeColumns(List<String> columns) {
        return columns.stream()
                .map(column -> column == null ? "" : column.trim().toLowerCase(Locale.ROOT))
                .toList();
    }

    private List<List<String>> normalizeRows(QueryResult result, List<String> normalizedColumns) {
        List<List<String>> rows = new ArrayList<>();
        for (List<Object> row : result.rows()) {
            List<String> normalized = new ArrayList<>(normalizedColumns.size());
            for (int i = 0; i < normalizedColumns.size(); i++) {
                Object value = i < row.size() ? row.get(i) : null;
                normalized.add(normalizeCell(value));
            }
            rows.add(normalized);
        }
        return rows;
    }

    private String normalizeCell(Object value) {
        if (value == null) {
            return "∅";
        }
        if (value instanceof BigDecimal bigDecimal) {
            return bigDecimal.stripTrailingZeros().toPlainString();
        }
        if (value instanceof Double doubleValue) {
            return BigDecimal.valueOf(doubleValue).stripTrailingZeros().toPlainString();
        }
        if (value instanceof Float floatValue) {
            return BigDecimal.valueOf(floatValue).stripTrailingZeros().toPlainString();
        }
        if (value instanceof Number number) {
            return new BigDecimal(number.toString()).stripTrailingZeros().toPlainString();
        }
        if (value instanceof Boolean bool) {
            return bool ? "true" : "false";
        }
        return value.toString().trim().toLowerCase(Locale.ROOT);
    }

    private Comparator<List<String>> rowComparator() {
        return (left, right) -> {
            int size = Math.min(left.size(), right.size());
            for (int i = 0; i < size; i++) {
                int compared = Objects.toString(left.get(i), "").compareTo(Objects.toString(right.get(i), ""));
                if (compared != 0) {
                    return compared;
                }
            }
            return Integer.compare(left.size(), right.size());
        };
    }
}
