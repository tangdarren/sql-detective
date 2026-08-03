package com.sqldetective.query;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record QueryExecutionResponse(
        List<String> columns,
        List<List<Object>> rows,
        int rowCount,
        long executionTimeMs,
        boolean correct,
        String feedback,
        QueryErrorType errorType
) {
    static QueryExecutionResponse error(String feedback, QueryErrorType errorType, long executionTimeMs) {
        return new QueryExecutionResponse(List.of(), List.of(), 0, executionTimeMs, false, feedback, errorType);
    }
}
