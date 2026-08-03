package com.sqldetective.schema;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class SchemaRepository {

    private final JdbcTemplate jdbcTemplate;

    public SchemaRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ColumnInfoResponse> findColumns(String tableName) {
        return jdbcTemplate.query(
                """
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = ?
                ORDER BY ordinal_position
                """,
                (rs, rowNum) -> new ColumnInfoResponse(
                        rs.getString("column_name"),
                        rs.getString("data_type"),
                        "YES".equalsIgnoreCase(rs.getString("is_nullable")),
                        rs.getString("column_default")
                ),
                tableName
        );
    }
}
