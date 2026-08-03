package com.sqldetective.schema;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

final class InvestigationTables {

    private static final Map<String, String> TABLES = new LinkedHashMap<>();

    static {
        TABLES.put("guests", "Registered hotel guests and room assignments.");
        TABLES.put("employees", "Hotel staff schedules and access levels.");
        TABLES.put("room_access_logs", "Door entry and exit records by room.");
        TABLES.put("payments", "Guest payment transactions.");
        TABLES.put("evidence_items", "Physical clues collected after the theft.");
    }

    private InvestigationTables() {
    }

    static List<String> names() {
        return List.copyOf(TABLES.keySet());
    }

    static Optional<String> description(String tableName) {
        return Optional.ofNullable(TABLES.get(tableName));
    }

    static boolean isAllowed(String tableName) {
        return TABLES.containsKey(tableName);
    }
}
