package com.sqldetective.challenge;

public record ChallengeRecord(
        int id,
        int levelNumber,
        String title,
        String storyText,
        String objective,
        String starterQuery,
        String hint,
        String successClue,
        String difficulty,
        boolean orderSensitive,
        String expectedQuery,
        String evidenceImageFilename
) {
}
