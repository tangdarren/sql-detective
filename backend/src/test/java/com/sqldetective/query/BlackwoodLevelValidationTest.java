package com.sqldetective.query;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sqldetective.support.PostgresIntegrationTest;

class BlackwoodLevelValidationTest extends PostgresIntegrationTest {

    private static final String LEVEL_1 = """
            SELECT full_name, room_number, vip_status
            FROM guests
            WHERE room_number BETWEEN 410 AND 422
              AND check_in_date <= DATE '2024-11-03'
              AND check_out_date > DATE '2024-11-03'
            ORDER BY room_number
            """;

    private static final String LEVEL_2 = """
            SELECT e.full_name, e.job_title, r.room_number, r.entry_time
            FROM employees e
            INNER JOIN room_access_logs r
              ON r.person_type = 'employee' AND r.person_id = e.id
            WHERE e.access_level = 'MASTER'
              AND r.access_method = 'MASTER_KEY'
              AND r.entry_time >= e.shift_start
              AND r.entry_time < e.shift_end
            """;

    private static final String LEVEL_2_ALTERNATE = """
            SELECT e.full_name, e.job_title, r.room_number, r.entry_time
            FROM room_access_logs r
            INNER JOIN employees e
              ON e.id = r.person_id
            WHERE r.person_type = 'employee'
              AND e.access_level = 'MASTER'
              AND r.access_method = 'MASTER_KEY'
              AND r.entry_time >= e.shift_start
              AND r.entry_time < e.shift_end
            """;

    private static final String LEVEL_3 = """
            SELECT person_type, person_id, entry_time, exit_time, access_method
            FROM room_access_logs
            WHERE room_number = 417
              AND entry_time BETWEEN TIMESTAMPTZ '2024-11-04 00:00:00+00'
                                 AND TIMESTAMPTZ '2024-11-04 02:00:00+00'
            """;

    private static final String LEVEL_3_ALTERNATE = """
            SELECT person_type, person_id, entry_time, exit_time, access_method
            FROM room_access_logs
            WHERE room_number = 417
              AND entry_time >= TIMESTAMPTZ '2024-11-04 00:00:00+00'
              AND entry_time <= TIMESTAMPTZ '2024-11-04 02:00:00+00'
            """;

    private static final String LEVEL_4 = """
            SELECT g.full_name,
                   COUNT(*) AS payment_count,
                   SUM(p.amount) AS total_amount
            FROM payments p
            INNER JOIN guests g ON g.id = p.guest_id
            WHERE p.payment_type = 'CASH'
              AND p.status = 'COMPLETED'
              AND p.payment_time BETWEEN TIMESTAMPTZ '2024-11-03 18:00:00+00'
                                     AND TIMESTAMPTZ '2024-11-04 03:00:00+00'
            GROUP BY g.full_name
            HAVING SUM(p.amount) > 200
            """;

    private static final String LEVEL_4_ALTERNATE = """
            SELECT g.full_name,
                   COUNT(p.id) AS payment_count,
                   SUM(p.amount) AS total_amount
            FROM guests g
            INNER JOIN payments p ON p.guest_id = g.id
            WHERE p.payment_type = 'CASH'
              AND p.status = 'COMPLETED'
              AND p.payment_time >= TIMESTAMPTZ '2024-11-03 18:00:00+00'
              AND p.payment_time <= TIMESTAMPTZ '2024-11-04 03:00:00+00'
            GROUP BY g.full_name
            HAVING SUM(p.amount) > 200
            """;

    private static final String LEVEL_5 = """
            SELECT g.full_name,
                   g.room_number,
                   r.entry_time,
                   r.access_method,
                   p.amount,
                   p.payment_time
            FROM guests g
            INNER JOIN room_access_logs r
              ON r.person_type = 'guest' AND r.person_id = g.id
            INNER JOIN payments p
              ON p.guest_id = g.id
            WHERE r.room_number = 417
              AND r.entry_time BETWEEN TIMESTAMPTZ '2024-11-04 00:00:00+00'
                                   AND TIMESTAMPTZ '2024-11-04 01:00:00+00'
              AND p.payment_type = 'CASH'
              AND p.status = 'COMPLETED'
              AND p.amount > 2000
              AND p.payment_time > r.entry_time
            """;

    private static final String LEVEL_5_SUBQUERY = """
            SELECT g.full_name,
                   g.room_number,
                   r.entry_time,
                   r.access_method,
                   p.amount,
                   p.payment_time
            FROM guests g
            INNER JOIN room_access_logs r
              ON r.person_type = 'guest' AND r.person_id = g.id
            INNER JOIN payments p
              ON p.guest_id = g.id
            WHERE g.id IN (
                SELECT person_id
                FROM room_access_logs
                WHERE person_type = 'guest'
                  AND room_number = 417
                  AND entry_time BETWEEN TIMESTAMPTZ '2024-11-04 00:00:00+00'
                                     AND TIMESTAMPTZ '2024-11-04 01:00:00+00'
            )
              AND r.room_number = 417
              AND r.entry_time BETWEEN TIMESTAMPTZ '2024-11-04 00:00:00+00'
                                   AND TIMESTAMPTZ '2024-11-04 01:00:00+00'
              AND p.payment_type = 'CASH'
              AND p.status = 'COMPLETED'
              AND p.amount > 2000
              AND p.payment_time > r.entry_time
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void level1ReturnsFourthFloorGuestsInRoomOrder() throws Exception {
        mockMvc.perform(post("/api/challenges/1/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.rowCount").value(6))
                .andExpect(jsonPath("$.rows[0][0]").value("Julian Pike"))
                .andExpect(jsonPath("$.rows[0][1]").value(410))
                .andExpect(jsonPath("$.feedback").value(
                        "Several guests stayed on the fourth floor near Room 417 that night — including the guest in Room 410 beside the crime scene."
                ));
    }

    @Test
    void level2ReturnsOnDutyMasterKeyHolders() throws Exception {
        mockMvc.perform(post("/api/challenges/2/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.rowCount").value(2))
                .andExpect(jsonPath("$.rows[*][0]", hasItem("Nora Kessler")))
                .andExpect(jsonPath("$.rows[*][0]", hasItem("Rita Solano")))
                .andExpect(jsonPath("$.feedback").value(
                        "Two master-key holders were active on duty that night, but their master-key logs never open Room 417 during the theft window."
                ));
    }

    @Test
    void level2AlternateJoinOrderPasses() throws Exception {
        mockMvc.perform(post("/api/challenges/2/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_2_ALTERNATE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.rowCount").value(2));
    }

    @Test
    void level2ExcludesMorningMasterKeyOutsideShift() throws Exception {
        String includesMorning = """
                SELECT e.full_name, e.job_title, r.room_number, r.entry_time
                FROM employees e
                INNER JOIN room_access_logs r
                  ON r.person_type = 'employee' AND r.person_id = e.id
                WHERE e.access_level = 'MASTER'
                  AND r.access_method = 'MASTER_KEY'
                  AND r.entry_time >= TIMESTAMPTZ '2024-11-03 00:00:00+00'
                  AND r.entry_time < TIMESTAMPTZ '2024-11-04 12:00:00+00'
                """;

        mockMvc.perform(post("/api/challenges/2/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(includesMorning)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false));
    }

    @Test
    void level3ReturnsGuestAndEmployeeInTheftWindow() throws Exception {
        mockMvc.perform(post("/api/challenges/3/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_3)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.rowCount").value(2))
                .andExpect(jsonPath("$.rows[*][0]", hasItem("guest")))
                .andExpect(jsonPath("$.rows[*][0]", hasItem("employee")))
                .andExpect(jsonPath("$.feedback").value(
                        "After midnight, Room 417 logged a guest keycard entry, then a security officer with a staff badge."
                ));
    }

    @Test
    void level3AlternateComparisonPasses() throws Exception {
        mockMvc.perform(post("/api/challenges/3/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_3_ALTERNATE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.rowCount").value(2));
    }

    @Test
    void level4ReturnsSuspiciousCashTotals() throws Exception {
        mockMvc.perform(post("/api/challenges/4/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_4)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.rowCount").value(3))
                .andExpect(jsonPath("$.rows[*][0]", hasItem("Julian Pike")))
                .andExpect(jsonPath("$.rows[*][0]", hasItem("Marcus Hale")))
                .andExpect(jsonPath("$.rows[*][0]", hasItem("Evelyn Crowe")));
    }

    @Test
    void level4AlternatePasses() throws Exception {
        mockMvc.perform(post("/api/challenges/4/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_4_ALTERNATE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.rowCount").value(3));
    }

    @Test
    void level5IdentifiesOnlyJulianPike() throws Exception {
        mockMvc.perform(post("/api/challenges/5/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_5)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.rowCount").value(1))
                .andExpect(jsonPath("$.rows[0][0]").value("Julian Pike"))
                .andExpect(jsonPath("$.rows[0][1]").value(410))
                .andExpect(jsonPath("$.feedback").value(
                        "The same guest who slipped into Room 417 just after midnight later settled a large cash payment."
                ));
    }

    @Test
    void level5SubqueryAlternatePasses() throws Exception {
        mockMvc.perform(post("/api/challenges/5/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(LEVEL_5_SUBQUERY)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.rowCount").value(1))
                .andExpect(jsonPath("$.rows[0][0]").value("Julian Pike"));
    }

    @Test
    void level5DoesNotMatchSecurityOfficerOrOtherCashGuests() throws Exception {
        String securityOfficer = """
                SELECT e.full_name, e.id AS room_number, r.entry_time, r.access_method, 1 AS amount, r.entry_time AS payment_time
                FROM employees e
                INNER JOIN room_access_logs r
                  ON r.person_type = 'employee' AND r.person_id = e.id
                WHERE r.room_number = 417
                  AND e.full_name = 'Tomás Nguyen'
                """;

        mockMvc.perform(post("/api/challenges/5/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(queryJson(securityOfficer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false));
    }

    private String queryJson(String sql) throws Exception {
        return objectMapper.writeValueAsString(new QueryExecutionRequest(sql));
    }
}
