package com.sqldetective.query;

public class SqlSafetyException extends RuntimeException {

    private final QueryErrorType errorType;

    public SqlSafetyException(QueryErrorType errorType, String message) {
        super(message);
        this.errorType = errorType;
    }

    public QueryErrorType getErrorType() {
        return errorType;
    }
}
