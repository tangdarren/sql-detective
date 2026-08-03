package com.sqldetective.query;

import org.springframework.stereotype.Service;

import com.sqldetective.challenge.ChallengeRecord;
import com.sqldetective.challenge.ChallengeRepository;
import com.sqldetective.exception.ResourceNotFoundException;

@Service
public class QueryExecutionService {

    private final ChallengeRepository challengeRepository;
    private final SqlSafetyValidator sqlSafetyValidator;
    private final ReadOnlyQueryExecutor readOnlyQueryExecutor;
    private final ResultValidator resultValidator;

    public QueryExecutionService(
            ChallengeRepository challengeRepository,
            SqlSafetyValidator sqlSafetyValidator,
            ReadOnlyQueryExecutor readOnlyQueryExecutor,
            ResultValidator resultValidator
    ) {
        this.challengeRepository = challengeRepository;
        this.sqlSafetyValidator = sqlSafetyValidator;
        this.readOnlyQueryExecutor = readOnlyQueryExecutor;
        this.resultValidator = resultValidator;
    }

    public QueryExecutionResponse execute(int levelNumber, QueryExecutionRequest request) {
        ChallengeRecord challenge = challengeRepository.findByLevelNumber(levelNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Challenge not found for level " + levelNumber
                ));

        long started = System.nanoTime();
        try {
            sqlSafetyValidator.validate(request == null ? null : request.query());
            QueryResult actual = readOnlyQueryExecutor.execute(request.query());
            QueryResult expected = readOnlyQueryExecutor.execute(challenge.expectedQuery());
            long elapsedMs = elapsedMillis(started);

            ResultValidator.Outcome outcome = resultValidator.validate(
                    actual,
                    expected,
                    challenge.orderSensitive()
            );

            return switch (outcome) {
                case CORRECT -> new QueryExecutionResponse(
                        actual.columns(),
                        actual.rows(),
                        actual.rowCount(),
                        elapsedMs,
                        true,
                        challenge.successClue(),
                        null
                );
                case WRONG_COLUMNS -> new QueryExecutionResponse(
                        actual.columns(),
                        actual.rows(),
                        actual.rowCount(),
                        elapsedMs,
                        false,
                        "Check which columns the objective requests.",
                        null
                );
                case WRONG_DATA -> new QueryExecutionResponse(
                        actual.columns(),
                        actual.rows(),
                        actual.rowCount(),
                        elapsedMs,
                        false,
                        "Your query returned the wrong evidence.",
                        null
                );
            };
        } catch (SqlSafetyException ex) {
            return QueryExecutionResponse.error(ex.getMessage(), ex.getErrorType(), elapsedMillis(started));
        }
    }

    private long elapsedMillis(long startedNanos) {
        return Math.max(0L, (System.nanoTime() - startedNanos) / 1_000_000L);
    }
}
