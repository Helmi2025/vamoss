package com.example.demo.tournament;

import com.example.demo.dto.MatchResultRequest;
import com.example.demo.entities.*;
import com.example.demo.repositories.TournamentMatchRepository;
import com.example.demo.repositories.TournamentRepository;
import com.example.demo.services.BracketServiceImpl;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import net.jqwik.api.*;
import org.junit.jupiter.api.Assertions;
import org.mockito.Mockito;

import java.util.Optional;
import java.util.Set;

public class MatchResultPropertyTest {

    private final Validator validator;

    public MatchResultPropertyTest() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        this.validator = factory.getValidator();
    }

    // Feature: tournament-management, Property 9: Winner determination is correct
    @Property(tries = 100)
    void winnerDeterminationIsCorrect(
            @ForAll("scorePairs") int[] scores,
            @ForAll("participantTypes") ParticipantType type
    ) {
        TournamentRepository tournamentRepo = Mockito.mock(TournamentRepository.class);
        TournamentMatchRepository matchRepo = Mockito.mock(TournamentMatchRepository.class);

        BracketServiceImpl bracketService = new BracketServiceImpl(
                tournamentRepo, null, matchRepo, null, null, null, null
        );

        Tournament tournament = new Tournament();
        tournament.setId("t-1");
        tournament.setStatus(TournamentStatus.BRACKET_GENERATED);

        TournamentMatch playedMatch = new TournamentMatch();
        playedMatch.setId("m-1");
        playedMatch.setTournamentId("t-1");
        playedMatch.setRound(MatchRound.FINAL);
        playedMatch.setParticipant1Id("P1");
        playedMatch.setParticipant1Type(type);
        playedMatch.setParticipant2Id("P2");
        playedMatch.setParticipant2Type(type);
        playedMatch.setScore1(scores[0]);
        playedMatch.setScore2(scores[1]);
        playedMatch.setStatus(MatchStatus.READY);

        bracketService.advanceWinner(playedMatch, tournament);

        String expectedWinnerId = scores[0] > scores[1] ? "P1" : "P2";

        Assertions.assertEquals(expectedWinnerId, playedMatch.getWinnerId());
        Assertions.assertEquals(type, playedMatch.getWinnerType());
        Assertions.assertEquals(MatchStatus.PLAYED, playedMatch.getStatus());
    }

    // Feature: tournament-management, Property 10: Negative scores rejected
    @Property(tries = 100)
    void negativeScoresRejected(
            @ForAll("negativeScores") int score1,
            @ForAll("negativeScores") int score2
    ) {
        MatchResultRequest request = new MatchResultRequest(score1, score2);
        Set<ConstraintViolation<MatchResultRequest>> violations = validator.validate(request);
        Assertions.assertFalse(violations.isEmpty(), "Negative scores must trigger validation constraint violation.");
    }

    @Provide
    Arbitrary<int[]> scorePairs() {
        return Arbitraries.integers().between(0, 999).list().ofSize(2).filter(list -> !list.get(0).equals(list.get(1)))
                .map(list -> new int[]{list.get(0), list.get(1)});
    }

    @Provide
    Arbitrary<ParticipantType> participantTypes() {
        return Arbitraries.of(ParticipantType.TEAM, ParticipantType.PLAYER);
    }

    @Provide
    Arbitrary<Integer> negativeScores() {
        return Arbitraries.integers().between(Integer.MIN_VALUE, -1);
    }
}
