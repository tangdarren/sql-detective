package com.sqldetective.schema;

import java.util.List;

public record TableDetailsResponse(
        String name,
        String description,
        List<ColumnInfoResponse> columns
) {
}
