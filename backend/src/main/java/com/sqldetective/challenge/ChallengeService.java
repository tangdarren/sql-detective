package com.sqldetective.challenge;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sqldetective.exception.ResourceNotFoundException;

@Service
public class ChallengeService {

    private final ChallengeRepository challengeRepository;

    public ChallengeService(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    public List<ChallengeSummaryResponse> listChallenges() {
        return challengeRepository.findAllOrdered().stream()
                .map(challenge -> new ChallengeSummaryResponse(
                        challenge.levelNumber(),
                        challenge.title(),
                        challenge.difficulty()
                ))
                .toList();
    }

    public ChallengeDetailResponse getChallenge(int levelNumber) {
        ChallengeRecord challenge = challengeRepository.findByLevelNumber(levelNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Challenge not found for level " + levelNumber
                ));

        return new ChallengeDetailResponse(
                challenge.levelNumber(),
                challenge.title(),
                challenge.storyText(),
                challenge.objective(),
                challenge.starterQuery(),
                challenge.hint(),
                challenge.difficulty(),
                challenge.orderSensitive(),
                challenge.evidenceImageFilename()
        );
    }
}
