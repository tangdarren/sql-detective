package com.sqldetective.query;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Connection;
import java.sql.Statement;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sqldetective.support.PostgresIntegrationTest;

class QueryExecutionIntegrationTest extends PostgresIntegrationTest {

    private static final String LEVEL_1_CORRECT = """
            SELECT full_name, room_number, vip_status
            FROM guests
            WHERE room_number BETWEEN 410 AND 422
              AND check_in_date <= DATE '2024-11-03'
              AND check_out_date > DATE '2024-11-03'
            ORDER BY room_number
            """;

    private static final String LEVEL_1_ALTERNATE = """
            SELECT full_name, room_number, vip_status
            FROM guests
            WHERE room_number >= 410
              AND room_number <= 422
              AND check_in_date <= '2024-11-03'
              AND check_out_date > '2024-11-03'
            ORDER BY room_number ASC
            """;

    private static final String LEVEL_3_BASE = """
            SELECT person_type, person_id, entry_time, exit_time, access_method
            FROM room_access_logs
            WHERE room_number = 417
              AND entry_time BETWEEN TIMESTAMPTZ '2024-11-04 00:00:00+00'
                                 AND TIMESTAMPTZ '2024-11-04 01:00:00+00'
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    @Qualifier("readOnlyDataSource")
    private DataSource readOnlyDataSource;

    @Autowired
    @Qualifier("readOnlyJdbcTemplate")
    private JdbcTemplate readOnlyJdbcTemplate;

    @Test
    void correctQueryPassesValidation() throws Exception {
        mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_1_CORRECT)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.rowCount").value(6))
                .andExpect(jsonPath("$.feedback").value(
                        "Several guests stayed on the fourth floor near Room 417 that night."
                ))
                .andExpect(jsonPath("$.errorType").doesNotExist())
                .andExpect(jsonPath("$.columns[0]").value("full_name"));
    }

    @Test
    void incorrectQueryFailsValidation() throws Exception {
        mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson("SELECT full_name FROM guests")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.feedback").value("Check which columns the objective requests."))
                .andExpect(jsonPath("$.errorType").doesNotExist());
    }

    @Test
    void alternateCorrectQueryPassesValidation() throws Exception {
        mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_1_ALTERNATE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.rowCount").value(6));
    }

    @Test
    void syntaxErrorReturnsFriendlyMessage() throws Exception {
        mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson("SELECT * FROM guests JOIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.errorType").value("SYNTAX_ERROR"))
                .andExpect(jsonPath("$.feedback").value("Your SQL contains a syntax error near JOIN."));
    }

    @Test
    void forbiddenInsertIsRejected() throws Exception {
        assertForbiddenWrite("INSERT INTO guests (full_name, room_number, check_in_date, check_out_date, vip_status) "
                + "VALUES ('Test', 101, '2024-11-03', '2024-11-04', FALSE)");
    }

    @Test
    void forbiddenUpdateIsRejected() throws Exception {
        assertForbiddenWrite("UPDATE guests SET full_name = 'Nope' WHERE id = 1");
    }

    @Test
    void forbiddenDeleteIsRejected() throws Exception {
        assertForbiddenWrite("DELETE FROM guests WHERE id = 1");
    }

    @Test
    void forbiddenDropIsRejected() throws Exception {
        assertForbiddenWrite("DROP TABLE guests");
    }

    @Test
    void multipleStatementsAreRejected() throws Exception {
        mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson("SELECT full_name FROM guests; SELECT room_number FROM guests")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.errorType").value("FORBIDDEN_STATEMENT"))
                .andExpect(jsonPath("$.feedback").value("Only read-only SELECT queries are allowed."));
    }

    @Test
    void hiddenSecondStatementIsRejected() throws Exception {
        mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson("SELECT full_name FROM guests; DELETE FROM guests")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errorType").value("FORBIDDEN_STATEMENT"));

        mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson("SELECT full_name FROM guests; /* cover */ DELETE FROM guests")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errorType").value("FORBIDDEN_STATEMENT"));
    }

    @Test
    void queryTimeoutIsHandled() throws Exception {
        mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson("SELECT pg_sleep(3)")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.errorType").value("TIMEOUT"))
                .andExpect(jsonPath("$.feedback").value("The query took too long and was stopped."));
    }

    @Test
    void resultRowsAreLimitedToOneHundred() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson("""
                                SELECT g1.id
                                FROM guests g1
                                CROSS JOIN guests g2
                                CROSS JOIN guests g3
                                """)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(body.get("rowCount").asInt()).isEqualTo(100);
        assertThat(body.get("rows")).hasSize(100);
    }

    @Test
    void readOnlyRoleCannotModifyData() throws Exception {
        assertThatThrownBy(() -> {
            try (Connection connection = readOnlyDataSource.getConnection();
                 Statement statement = connection.createStatement()) {
                statement.executeUpdate("INSERT INTO guests (full_name, room_number, check_in_date, check_out_date, vip_status) "
                        + "VALUES ('Blocked', 111, '2024-11-03', '2024-11-04', FALSE)");
            }
        }).hasStackTraceContaining("permission denied");

        assertThatThrownBy(() -> readOnlyJdbcTemplate.queryForList("SELECT * FROM challenges"))
                .hasStackTraceContaining("permission denied");
    }

    @Test
    void orderSensitiveComparisonRequiresMatchingRowOrder() throws Exception {
        String reversed = """
                SELECT full_name, room_number, vip_status
                FROM guests
                WHERE room_number BETWEEN 410 AND 422
                  AND check_in_date <= DATE '2024-11-03'
                  AND check_out_date > DATE '2024-11-03'
                ORDER BY room_number DESC
                """;

        mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(reversed)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.feedback").value("Your query returned the wrong evidence."));
    }

    @Test
    void orderInsensitiveComparisonAcceptsDifferentRowOrder() throws Exception {
        String ordered = LEVEL_3_BASE + " ORDER BY person_id DESC";

        mockMvc.perform(post("/api/challenges/3/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_3_BASE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true));

        mockMvc.perform(post("/api/challenges/3/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(ordered)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true));
    }

    @Test
    void invalidChallengeNumberReturnsNotFound() throws Exception {
        mockMvc.perform(post("/api/challenges/99/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson("SELECT 1")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Challenge not found for level 99"));
    }

    private void assertForbiddenWrite(String sql) throws Exception {
        mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(sql)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.errorType").value("FORBIDDEN_STATEMENT"))
                .andExpect(jsonPath("$.feedback").value("Only read-only SELECT queries are allowed."))
                .andExpect(jsonPath("$.rows").isEmpty());
    }

    private String queryJson(String sql) throws Exception {
        return objectMapper.writeValueAsString(new QueryExecutionRequest(sql));
    }
}
