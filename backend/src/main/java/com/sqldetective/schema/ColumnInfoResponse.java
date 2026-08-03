package com.sqldetective.schema;

public record ColumnInfoResponse(
        String name,
        String dataType,
        boolean nullable,
        String defaultValue
) {
}
