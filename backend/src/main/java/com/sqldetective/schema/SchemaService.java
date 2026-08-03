package com.sqldetective.schema;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sqldetective.exception.ResourceNotFoundException;

@Service
public class SchemaService {

    private final SchemaRepository schemaRepository;

    public SchemaService(SchemaRepository schemaRepository) {
        this.schemaRepository = schemaRepository;
    }

    public List<TableSummaryResponse> listTables() {
        return InvestigationTables.names().stream()
                .map(name -> new TableSummaryResponse(
                        name,
                        InvestigationTables.description(name).orElse("")
                ))
                .toList();
    }

    public TableDetailsResponse getTable(String tableName) {
        String normalized = tableName == null ? "" : tableName.toLowerCase();
        if (!InvestigationTables.isAllowed(normalized)) {
            throw new ResourceNotFoundException("Table not found: " + tableName);
        }

        List<ColumnInfoResponse> columns = schemaRepository.findColumns(normalized);
        if (columns.isEmpty()) {
            throw new ResourceNotFoundException("Table not found: " + tableName);
        }

        return new TableDetailsResponse(
                normalized,
                InvestigationTables.description(normalized).orElse(""),
                columns
        );
    }
}
