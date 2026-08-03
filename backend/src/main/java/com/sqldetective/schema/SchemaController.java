package com.sqldetective.schema;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/schema/tables")
public class SchemaController {

    private final SchemaService schemaService;

    public SchemaController(SchemaService schemaService) {
        this.schemaService = schemaService;
    }

    @GetMapping
    public List<TableSummaryResponse> listTables() {
        return schemaService.listTables();
    }

    @GetMapping("/{tableName}")
    public TableDetailsResponse getTable(@PathVariable String tableName) {
        return schemaService.getTable(tableName);
    }
}
