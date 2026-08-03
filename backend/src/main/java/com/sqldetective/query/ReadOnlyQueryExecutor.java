package com.sqldetective.query;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.sqldetective.config.QueryProperties;

@Component
public class ReadOnlyQueryExecutor {

    private final JdbcTemplate readOnlyJdbcTemplate;
    private final QueryProperties queryProperties;

    public ReadOnlyQueryExecutor(
            @Qualifier("readOnlyJdbcTemplate") JdbcTemplate readOnlyJdbcTemplate,
            QueryProperties queryProperties
    ) {
        this.readOnlyJdbcTemplate = readOnlyJdbcTemplate;
        this.queryProperties = queryProperties;
    }

    public QueryResult execute(String sql) {
        try {
            return readOnlyJdbcTemplate.execute((ConnectionCallback<QueryResult>) connection -> {
                boolean previousAutoCommit = connection.getAutoCommit();
                connection.setAutoCommit(false);
                try (Statement statement = connection.createStatement()) {
                    connection.setReadOnly(true);
                    statement.execute("SET TRANSACTION READ ONLY");
                    statement.execute("SET LOCAL statement_timeout = '" + queryProperties.getStatementTimeoutMs() + "ms'");
                    statement.setMaxRows(queryProperties.getMaxRows());

                    boolean hasResultSet = statement.execute(sql);
                    if (!hasResultSet) {
                        throw new SqlSafetyException(
                                QueryErrorType.FORBIDDEN_STATEMENT,
                                "Only read-only SELECT queries are allowed."
                        );
                    }

                    try (ResultSet resultSet = statement.getResultSet()) {
                        return mapResultSet(resultSet, queryProperties.getMaxRows());
                    }
                } catch (SQLException ex) {
                    connection.rollback();
                    throw translateSqlException(ex);
                } finally {
                    try {
                        connection.rollback();
                    } catch (SQLException ignored) {
                        // ignore rollback problems after failures
                    }
                    connection.setAutoCommit(previousAutoCommit);
                }
            });
        } catch (DataAccessException ex) {
            Throwable root = ex.getMostSpecificCause();
            if (root instanceof SQLException sqlException) {
                throw translateSqlException(sqlException);
            }
            if (ex.getCause() instanceof SqlSafetyException safetyException) {
                throw safetyException;
            }
            throw new SqlSafetyException(
                    QueryErrorType.EXECUTION_ERROR,
                    "The query could not be executed."
            );
        }
    }

    DataSource readOnlyDataSource() {
        return readOnlyJdbcTemplate.getDataSource();
    }

    private QueryResult mapResultSet(ResultSet resultSet, int maxRows) throws SQLException {
        ResultSetMetaData metaData = resultSet.getMetaData();
        int columnCount = metaData.getColumnCount();
        List<String> columns = new ArrayList<>(columnCount);
        for (int i = 1; i <= columnCount; i++) {
            String label = metaData.getColumnLabel(i);
            columns.add(label == null ? metaData.getColumnName(i) : label);
        }

        List<List<Object>> rows = new ArrayList<>();
        boolean truncated = false;
        while (resultSet.next()) {
            if (rows.size() >= maxRows) {
                truncated = true;
                break;
            }
            List<Object> row = new ArrayList<>(columnCount);
            for (int i = 1; i <= columnCount; i++) {
                row.add(normalizeValue(resultSet, i, metaData.getColumnType(i)));
            }
            rows.add(row);
        }
        return new QueryResult(columns, List.copyOf(rows), truncated);
    }

    private Object normalizeValue(ResultSet resultSet, int index, int columnType) throws SQLException {
        Object value = resultSet.getObject(index);
        if (value == null || resultSet.wasNull()) {
            return null;
        }
        return switch (columnType) {
            case Types.BOOLEAN, Types.BIT -> resultSet.getBoolean(index);
            case Types.TINYINT, Types.SMALLINT, Types.INTEGER -> resultSet.getLong(index);
            case Types.BIGINT -> resultSet.getLong(index);
            case Types.NUMERIC, Types.DECIMAL -> resultSet.getBigDecimal(index).stripTrailingZeros();
            case Types.REAL, Types.FLOAT, Types.DOUBLE -> BigDecimal.valueOf(resultSet.getDouble(index)).stripTrailingZeros();
            case Types.DATE -> resultSet.getDate(index).toLocalDate().toString();
            case Types.TIMESTAMP, Types.TIMESTAMP_WITH_TIMEZONE -> normalizeTimestamp(resultSet.getObject(index));
            default -> normalizeObject(value);
        };
    }

    private Object normalizeObject(Object value) {
        if (value instanceof BigDecimal bigDecimal) {
            return bigDecimal.stripTrailingZeros();
        }
        if (value instanceof Date date) {
            return date.toLocalDate().toString();
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toInstant().toString();
        }
        if (value instanceof OffsetDateTime offsetDateTime) {
            return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(offsetDateTime);
        }
        if (value instanceof Boolean || value instanceof Number || value instanceof String) {
            return value;
        }
        return String.valueOf(value);
    }

    private Object normalizeTimestamp(Object value) {
        if (value instanceof OffsetDateTime offsetDateTime) {
            return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(offsetDateTime);
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toInstant().toString();
        }
        return String.valueOf(value);
    }

    private SqlSafetyException translateSqlException(SQLException ex) {
        String message = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase(Locale.ROOT);
        String sqlState = ex.getSQLState();

        if ("57014".equals(sqlState) || message.contains("statement timeout") || message.contains("canceling statement")) {
            return new SqlSafetyException(
                    QueryErrorType.TIMEOUT,
                    "The query took too long and was stopped."
            );
        }
        if ("42501".equals(sqlState) || message.contains("permission denied") || message.contains("read-only")) {
            return new SqlSafetyException(
                    QueryErrorType.FORBIDDEN_STATEMENT,
                    "Only read-only SELECT queries are allowed."
            );
        }
        if (sqlState != null && sqlState.startsWith("42")) {
            return new SqlSafetyException(
                    QueryErrorType.SYNTAX_ERROR,
                    buildDatabaseSyntaxFeedback(ex.getMessage())
            );
        }
        return new SqlSafetyException(
                QueryErrorType.EXECUTION_ERROR,
                "The query could not be executed."
        );
    }

    private String buildDatabaseSyntaxFeedback(String message) {
        if (message == null || message.isBlank()) {
            return "Your SQL contains a syntax error.";
        }
        String upper = message.toUpperCase(Locale.ROOT);
        for (String token : List.of("JOIN", "WHERE", "SELECT", "FROM", "GROUP", "ORDER", "HAVING", "WITH")) {
            if (upper.contains(token)) {
                return "Your SQL contains a syntax error near " + token + ".";
            }
        }
        return "Your SQL contains a syntax error.";
    }
}
