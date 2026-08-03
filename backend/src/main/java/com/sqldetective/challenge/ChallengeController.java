package com.sqldetective.challenge;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @GetMapping
    public List<ChallengeSummaryResponse> listChallenges() {
        return challengeService.listChallenges();
    }

    @GetMapping("/{levelNumber}")
    public ChallengeDetailResponse getChallenge(@PathVariable int levelNumber) {
        return challengeService.getChallenge(levelNumber);
    }
}
