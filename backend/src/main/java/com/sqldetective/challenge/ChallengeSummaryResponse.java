package com.sqldetective.challenge;

public record ChallengeSummaryResponse(
        int levelNumber,
        String title,
        String difficulty
) {
}
