package com.sqldetective.query;

import java.util.List;

public record QueryResult(
        List<String> columns,
        List<List<Object>> rows,
        boolean truncated
) {
    int rowCount() {
        return rows.size();
    }
}
