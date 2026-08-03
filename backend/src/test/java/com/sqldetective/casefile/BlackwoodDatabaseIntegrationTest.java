package com.sqldetective.casefile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;
import com.sqldetective.support.PostgresIntegrationTest;

class BlackwoodDatabaseIntegrationTest extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void flywayMigrationsApplied() {
        Integer migrationCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE success = TRUE",
                Integer.class
        );

        assertThat(migrationCount).isGreaterThanOrEqualTo(3);
        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'guests'",
                Integer.class
        )).isEqualTo(1);
    }

    @Test
    void seedDataIsLoaded() {
        assertThat(count("guests")).isEqualTo(8);
        assertThat(count("employees")).isEqualTo(6);
        assertThat(count("room_access_logs")).isEqualTo(14);
        assertThat(count("payments")).isEqualTo(15);
        assertThat(count("evidence_items")).isEqualTo(4);
        assertThat(count("challenges")).isEqualTo(5);
    }

    @Test
    void caseEndpointReturnsBlackwoodSummary() throws Exception {
        mockMvc.perform(get("/api/cases/blackwood"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caseId").value("blackwood"))
                .andExpect(jsonPath("$.title").value("Case 01: The Blackwood Hotel"))
                .andExpect(jsonPath("$.challengeCount").value(5))
                .andExpect(jsonPath("$.eventDate").value("2024-11-03"));
    }

    @Test
    void challengeListAndDetailHideSensitiveFields() throws Exception {
        mockMvc.perform(get("/api/challenges"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$[0].levelNumber").value(1))
                .andExpect(jsonPath("$[0].title").value("The Guest Registry"))
                .andExpect(jsonPath("$[0].successClue").doesNotExist())
                .andExpect(jsonPath("$[0].objective").doesNotExist());

        String body = mockMvc.perform(get("/api/challenges/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.levelNumber").value(5))
                .andExpect(jsonPath("$.title").value("Identify the Thief"))
                .andExpect(jsonPath("$.objective").exists())
                .andExpect(jsonPath("$.starterQuery").exists())
                .andExpect(jsonPath("$.hint").exists())
                .andExpect(jsonPath("$.successClue").doesNotExist())
                .andExpect(jsonPath("$.expectedRows").doesNotExist())
                .andExpect(jsonPath("$.answerQuery").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(body.toLowerCase()).doesNotContain("julian pike");
    }

    @Test
    void invalidChallengeNumberReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/challenges/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Challenge not found for level 99"));
    }

    @Test
    void schemaTablesEndpointReturnsInvestigationTables() throws Exception {
        mockMvc.perform(get("/api/schema/tables"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$[0].name").value("guests"))
                .andExpect(jsonPath("$[4].name").value("evidence_items"));

        mockMvc.perform(get("/api/schema/tables/guests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("guests"))
                .andExpect(jsonPath("$.columns.length()").value(6))
                .andExpect(jsonPath("$.columns[0].name").value("id"));
    }

    @Test
    void invalidTableNameReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/schema/tables/challenges"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Table not found: challenges"));

        mockMvc.perform(get("/api/schema/tables/not_a_table"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Table not found: not_a_table"));
    }

    @Test
    void challengePayloadNeverIncludesSuccessClues() throws Exception {
        String listBody = mockMvc.perform(get("/api/challenges"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        List<Map<String, Object>> challenges = JsonPath.read(listBody, "$");
        assertThat(challenges).allSatisfy(challenge ->
                assertThat(challenge.keySet()).containsExactlyInAnyOrder("levelNumber", "title", "difficulty")
        );
    }

    private int count(String table) {
        Integer value = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);
        return value == null ? 0 : value;
    }
}
