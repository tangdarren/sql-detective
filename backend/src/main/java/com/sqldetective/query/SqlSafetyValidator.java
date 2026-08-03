package com.sqldetective.query;

import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Component;

import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statements;
import net.sf.jsqlparser.statement.select.ParenthesedSelect;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.select.SetOperationList;
import net.sf.jsqlparser.statement.select.WithItem;

@Component
public class SqlSafetyValidator {

    private static final Set<String> FORBIDDEN_KEYWORDS = Set.of(
            "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE",
            "GRANT", "REVOKE", "COPY", "CALL", "MERGE", "REPLACE", "COMMENT",
            "VACUUM", "ANALYZE", "REINDEX", "CLUSTER", "REFRESH"
    );

    public void validate(String rawSql) {
        if (rawSql == null || rawSql.isBlank()) {
            throw new SqlSafetyException(
                    QueryErrorType.FORBIDDEN_STATEMENT,
                    "Only read-only SELECT queries are allowed."
            );
        }

        String sql = rawSql.trim();
        rejectObviousForbiddenKeywords(sql);

        Statements statements;
        try {
            statements = CCJSqlParserUtil.parseStatements(sql);
        } catch (JSQLParserException ex) {
            throw new SqlSafetyException(
                    QueryErrorType.SYNTAX_ERROR,
                    buildSyntaxFeedback(ex.getMessage())
            );
        }

        List<net.sf.jsqlparser.statement.Statement> parsed = statements.getStatements();
        if (parsed == null || parsed.isEmpty()) {
            throw new SqlSafetyException(
                    QueryErrorType.FORBIDDEN_STATEMENT,
                    "Only read-only SELECT queries are allowed."
            );
        }
        if (parsed.size() > 1) {
            throw new SqlSafetyException(
                    QueryErrorType.FORBIDDEN_STATEMENT,
                    "Only read-only SELECT queries are allowed."
            );
        }

        net.sf.jsqlparser.statement.Statement statement = parsed.getFirst();
        if (!(statement instanceof Select select)) {
            throw new SqlSafetyException(
                    QueryErrorType.FORBIDDEN_STATEMENT,
                    "Only read-only SELECT queries are allowed."
            );
        }

        validateSelect(select);
    }

    private void validateSelect(Select select) {
        if (select.getForMode() != null || select.getForUpdateTable() != null) {
            throw new SqlSafetyException(
                    QueryErrorType.FORBIDDEN_STATEMENT,
                    "Only read-only SELECT queries are allowed."
            );
        }

        if (select.getWithItemsList() != null) {
            for (WithItem withItem : select.getWithItemsList()) {
                if (withItem.getSelect() != null) {
                    validateSelect(withItem.getSelect());
                }
            }
        }

        switch (select) {
            case PlainSelect plainSelect -> validatePlainSelect(plainSelect);
            case SetOperationList setOperationList -> {
                for (Select child : setOperationList.getSelects()) {
                    validateSelect(child);
                }
            }
            case ParenthesedSelect parenthesedSelect -> validateSelect(parenthesedSelect.getSelect());
            default -> throw new SqlSafetyException(
                    QueryErrorType.FORBIDDEN_STATEMENT,
                    "Only read-only SELECT queries are allowed."
            );
        }
    }

    private void validatePlainSelect(PlainSelect plainSelect) {
        if (plainSelect.getIntoTables() != null && !plainSelect.getIntoTables().isEmpty()) {
            throw new SqlSafetyException(
                    QueryErrorType.FORBIDDEN_STATEMENT,
                    "Only read-only SELECT queries are allowed."
            );
        }
        if (plainSelect.getIntoTempTable() != null) {
            throw new SqlSafetyException(
                    QueryErrorType.FORBIDDEN_STATEMENT,
                    "Only read-only SELECT queries are allowed."
            );
        }
    }

    private void rejectObviousForbiddenKeywords(String sql) {
        // Defense in depth for parser edge cases; primary validation is JSqlParser.
        String upper = stripQuotesAndComments(sql).toUpperCase(Locale.ROOT);
        for (String keyword : FORBIDDEN_KEYWORDS) {
            if (containsKeyword(upper, keyword)) {
                throw new SqlSafetyException(
                        QueryErrorType.FORBIDDEN_STATEMENT,
                        "Only read-only SELECT queries are allowed."
                );
            }
        }
    }

    private boolean containsKeyword(String sql, String keyword) {
        int index = 0;
        while ((index = sql.indexOf(keyword, index)) >= 0) {
            boolean startOk = index == 0 || !isIdentifierChar(sql.charAt(index - 1));
            int end = index + keyword.length();
            boolean endOk = end >= sql.length() || !isIdentifierChar(sql.charAt(end));
            if (startOk && endOk) {
                return true;
            }
            index = end;
        }
        return false;
    }

    private boolean isIdentifierChar(char c) {
        return Character.isLetterOrDigit(c) || c == '_';
    }

    private String stripQuotesAndComments(String sql) {
        StringBuilder cleaned = new StringBuilder(sql.length());
        boolean inSingle = false;
        boolean inDouble = false;
        boolean inLineComment = false;
        boolean inBlockComment = false;

        for (int i = 0; i < sql.length(); i++) {
            char current = sql.charAt(i);
            char next = i + 1 < sql.length() ? sql.charAt(i + 1) : '\0';

            if (inLineComment) {
                if (current == '\n') {
                    inLineComment = false;
                    cleaned.append(' ');
                }
                continue;
            }
            if (inBlockComment) {
                if (current == '*' && next == '/') {
                    inBlockComment = false;
                    i++;
                }
                continue;
            }
            if (!inSingle && !inDouble && current == '-' && next == '-') {
                inLineComment = true;
                i++;
                continue;
            }
            if (!inSingle && !inDouble && current == '/' && next == '*') {
                inBlockComment = true;
                i++;
                continue;
            }
            if (!inDouble && current == '\'') {
                inSingle = !inSingle;
                cleaned.append(' ');
                continue;
            }
            if (!inSingle && current == '"') {
                inDouble = !inDouble;
                cleaned.append(' ');
                continue;
            }
            cleaned.append(inSingle || inDouble ? ' ' : current);
        }
        return cleaned.toString();
    }

    private String buildSyntaxFeedback(String parserMessage) {
        if (parserMessage == null || parserMessage.isBlank()) {
            return "Your SQL contains a syntax error.";
        }
        String upper = parserMessage.toUpperCase(Locale.ROOT);
        for (String token : List.of("JOIN", "WHERE", "SELECT", "FROM", "GROUP", "ORDER", "HAVING", "WITH")) {
            if (upper.contains(token)) {
                return "Your SQL contains a syntax error near " + token + ".";
            }
        }
        return "Your SQL contains a syntax error.";
    }
}
