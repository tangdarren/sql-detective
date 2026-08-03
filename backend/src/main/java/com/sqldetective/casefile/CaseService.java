package com.sqldetective.casefile;

import org.springframework.stereotype.Service;

import com.sqldetective.challenge.ChallengeRepository;

@Service
public class CaseService {

    private static final String BLACKWOOD_CASE_ID = "blackwood";

    private final ChallengeRepository challengeRepository;

    public CaseService(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    public CaseResponse getBlackwoodCase() {
        return new CaseResponse(
                BLACKWOOD_CASE_ID,
                "Case 01: The Blackwood Hotel",
                "The Missing Portrait",
                "A valuable painting disappeared from Room 417 during a private event. Hotel ledgers, guest logs, and staff schedules remain. Query the records and identify the thief.",
                "Blackwood Hotel",
                "2024-11-03",
                challengeRepository.countAll()
        );
    }
}
