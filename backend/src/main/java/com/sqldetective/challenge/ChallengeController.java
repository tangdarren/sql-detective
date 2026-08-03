package com.sqldetective.challenge;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sqldetective.query.QueryExecutionRequest;
import com.sqldetective.query.QueryExecutionResponse;
import com.sqldetective.query.QueryExecutionService;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;
    private final QueryExecutionService queryExecutionService;

    public ChallengeController(
            ChallengeService challengeService,
            QueryExecutionService queryExecutionService
    ) {
        this.challengeService = challengeService;
        this.queryExecutionService = queryExecutionService;
    }

    @GetMapping
    public List<ChallengeSummaryResponse> listChallenges() {
        return challengeService.listChallenges();
    }

    @GetMapping("/{levelNumber}")
    public ChallengeDetailResponse getChallenge(@PathVariable int levelNumber) {
        return challengeService.getChallenge(levelNumber);
    }

    @PostMapping("/{levelNumber}/execute")
    public QueryExecutionResponse executeQuery(
            @PathVariable int levelNumber,
            @RequestBody QueryExecutionRequest request
    ) {
        return queryExecutionService.execute(levelNumber, request);
    }
}
