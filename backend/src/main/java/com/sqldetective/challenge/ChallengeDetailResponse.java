package com.sqldetective.challenge;

public record ChallengeDetailResponse(
        int levelNumber,
        String title,
        String storyText,
        String objective,
        String starterQuery,
        String hint,
        String difficulty,
        boolean orderSensitive,
        String evidenceImageFilename
) {
}
