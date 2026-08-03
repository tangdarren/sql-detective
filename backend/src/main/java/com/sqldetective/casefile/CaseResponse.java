package com.sqldetective.casefile;

public record CaseResponse(
        String caseId,
        String title,
        String subtitle,
        String synopsis,
        String setting,
        String eventDate,
        int challengeCount
) {
}
