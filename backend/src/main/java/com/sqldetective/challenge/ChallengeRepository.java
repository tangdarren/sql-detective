package com.sqldetective.challenge;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class ChallengeRepository {

    private static final RowMapper<ChallengeRecord> CHALLENGE_MAPPER = (rs, rowNum) -> new ChallengeRecord(
            rs.getInt("id"),
            rs.getInt("level_number"),
            rs.getString("title"),
            rs.getString("story_text"),
            rs.getString("objective"),
            rs.getString("starter_query"),
            rs.getString("hint"),
            rs.getString("success_clue"),
            rs.getString("difficulty"),
            rs.getBoolean("order_sensitive")
    );

    private final JdbcTemplate jdbcTemplate;

    public ChallengeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ChallengeRecord> findAllOrdered() {
        return jdbcTemplate.query(
                """
                SELECT id, level_number, title, story_text, objective, starter_query,
                       hint, success_clue, difficulty, order_sensitive
                FROM challenges
                ORDER BY level_number
                """,
                CHALLENGE_MAPPER
        );
    }

    public Optional<ChallengeRecord> findByLevelNumber(int levelNumber) {
        List<ChallengeRecord> results = jdbcTemplate.query(
                """
                SELECT id, level_number, title, story_text, objective, starter_query,
                       hint, success_clue, difficulty, order_sensitive
                FROM challenges
                WHERE level_number = ?
                """,
                CHALLENGE_MAPPER,
                levelNumber
        );
        return results.stream().findFirst();
    }

    public int countAll() {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM challenges", Integer.class);
        return count == null ? 0 : count;
    }
}
