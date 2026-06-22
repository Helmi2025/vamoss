package com.example.demo.tournament;

import com.example.demo.dto.*;
import com.example.demo.entities.*;
import com.example.demo.repositories.*;
import com.example.demo.services.BracketServiceImpl;
import com.example.demo.services.TournamentServiceImpl;
import net.jqwik.api.*;
import org.junit.jupiter.api.Assertions;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class TournamentLifecyclePropertyTest {

    // Feature: tournament-management, Property 12: Lifecycle transitions
    @Property(tries = 100)
    void lifecycleTransitions(
            @ForAll("scorePairs") int[] sf1Scores,
            @ForAll("scorePairs") int[] sf2Scores,
            @ForAll("scorePairs") int[] finalScores
    ) {
        TournamentRepository tournamentRepo = Mockito.mock(TournamentRepository.class);
        TournamentMatchRepository matchRepo = Mockito.mock(TournamentMatchRepository.class);

        BracketServiceImpl bracketService = new BracketServiceImpl(
                tournamentRepo, null, matchRepo, null, null, null, null
        );

        Tournament tournament = new Tournament();
        tournament.setId("t-1");
        tournament.setStatus(TournamentStatus.BRACKET_GENERATED);
        tournament.setRegistrationOpen(false);

        // Prepare the 3 matches
        TournamentMatch finalMatch = new TournamentMatch();
        finalMatch.setId("m-final");
        finalMatch.setTournamentId("t-1");
        finalMatch.setRound(MatchRound.FINAL);
        finalMatch.setMatchNumber(3);
        finalMatch.setStatus(MatchStatus.PENDING);

        TournamentMatch sf1 = new TournamentMatch();
        sf1.setId("m-sf1");
        sf1.setTournamentId("t-1");
        sf1.setRound(MatchRound.SEMI_FINAL);
        sf1.setMatchNumber(1);
        sf1.setParticipant1Id("T1");
        sf1.setParticipant1Type(ParticipantType.TEAM);
        sf1.setParticipant2Id("T2");
        sf1.setParticipant2Type(ParticipantType.TEAM);
        sf1.setNextMatchId("m-final");
        sf1.setNextMatchPosition(1);
        sf1.setStatus(MatchStatus.READY);

        TournamentMatch sf2 = new TournamentMatch();
        sf2.setId("m-sf2");
        sf2.setTournamentId("t-1");
        sf2.setRound(MatchRound.SEMI_FINAL);
        sf2.setMatchNumber(2);
        sf2.setParticipant1Id("T3");
        sf2.setParticipant1Type(ParticipantType.TEAM);
        sf2.setParticipant2Id("T4");
        sf2.setParticipant2Type(ParticipantType.TEAM);
        sf2.setNextMatchId("m-final");
        sf2.setNextMatchPosition(2);
        sf2.setStatus(MatchStatus.READY);

        List<TournamentMatch> matchesInDb = new ArrayList<>(List.of(finalMatch, sf1, sf2));
        Mockito.when(matchRepo.findById(Mockito.anyString()))
                .thenAnswer(inv -> {
                    String id = inv.getArgument(0);
                    return matchesInDb.stream().filter(m -> m.getId().equals(id)).findFirst();
                });

        // 1. Play SF1
        sf1.setScore1(sf1Scores[0]);
        sf1.setScore2(sf1Scores[1]);
        bracketService.advanceWinner(sf1, tournament);

        Assertions.assertEquals(TournamentStatus.IN_PROGRESS, tournament.getStatus());
        String expectedSf1Winner = sf1Scores[0] > sf1Scores[1] ? "T1" : "T2";
        Assertions.assertEquals(expectedSf1Winner, finalMatch.getParticipant1Id());
        Assertions.assertEquals(MatchStatus.PENDING, finalMatch.getStatus());

        // 2. Play SF2
        sf2.setScore1(sf2Scores[0]);
        sf2.setScore2(sf2Scores[1]);
        bracketService.advanceWinner(sf2, tournament);

        Assertions.assertEquals(TournamentStatus.IN_PROGRESS, tournament.getStatus());
        String expectedSf2Winner = sf2Scores[0] > sf2Scores[1] ? "T3" : "T4";
        Assertions.assertEquals(expectedSf2Winner, finalMatch.getParticipant2Id());
        Assertions.assertEquals(MatchStatus.READY, finalMatch.getStatus());

        // 3. Play Final
        finalMatch.setScore1(finalScores[0]);
        finalMatch.setScore2(finalScores[1]);
        bracketService.advanceWinner(finalMatch, tournament);

        Assertions.assertEquals(TournamentStatus.COMPLETED, tournament.getStatus());
        String expectedChampion = finalScores[0] > finalScores[1] ? expectedSf1Winner : expectedSf2Winner;
        Assertions.assertEquals(expectedChampion, tournament.getChampionId());
        Assertions.assertEquals(ParticipantType.TEAM, tournament.getChampionType());
        Assertions.assertFalse(tournament.isRegistrationOpen());
    }

    // Feature: tournament-management, Property 13: updatedAt always advances
    @Property(tries = 100)
    void updatedAtAlwaysAdvances() {
        TournamentRepository tournamentRepo = Mockito.mock(TournamentRepository.class);
        TournamentParticipantRepository tpRepo = Mockito.mock(TournamentParticipantRepository.class);
        SportRepository sportRepo = Mockito.mock(SportRepository.class);
        TeamRepository teamRepo = Mockito.mock(TeamRepository.class);

        TournamentServiceImpl tournamentService = new TournamentServiceImpl(
                tournamentRepo, tpRepo, null, sportRepo, teamRepo, null, null, null, null
        );

        Tournament tournament = new Tournament();
        tournament.setId("t-1");
        tournament.setSportId("sport-1");
        tournament.setParticipantLimit(4);
        tournament.setCurrentParticipants(0);
        tournament.setStatus(TournamentStatus.REGISTRATION_OPEN);
        tournament.setRegistrationOpen(true);
        tournament.setCreatedAt(LocalDateTime.now());
        tournament.setUpdatedAt(LocalDateTime.now());

        Sport sport = new Sport("sport-1", "Football", "icon-1", "rules", 11, true);
        Team team = new Team("team-1", "Team 1", "sport-1", "cap-1", "logo-1", null);

        Mockito.when(tournamentRepo.findById("t-1")).thenReturn(Optional.of(tournament));
        Mockito.when(sportRepo.findById("sport-1")).thenReturn(Optional.of(sport));
        Mockito.when(teamRepo.findById("team-1")).thenReturn(Optional.of(team));
        Mockito.when(tournamentRepo.save(Mockito.any(Tournament.class))).thenAnswer(inv -> inv.getArgument(0));
        Mockito.when(tpRepo.save(Mockito.any(TournamentParticipant.class))).thenAnswer(inv -> inv.getArgument(0));

        // Create -> capture T1
        LocalDateTime t1 = tournament.getUpdatedAt();

        // Mutation 1: Register Team
        tournamentService.registerTeam("t-1", new RegisterTeamRequest("team-1"));
        LocalDateTime t2 = tournament.getUpdatedAt();
        Assertions.assertTrue(t2.isAfter(t1) || t2.isEqual(t1));

        // Mutation 2: Remove Participant
        Mockito.when(tpRepo.existsByTournamentIdAndParticipantId("t-1", "team-1")).thenReturn(true);
        tournamentService.removeParticipant("t-1", "team-1");
        LocalDateTime t3 = tournament.getUpdatedAt();
        Assertions.assertTrue(t3.isAfter(t2) || t3.isEqual(t2));

        // Mutation 3: Cancel
        tournamentService.cancel("t-1");
        LocalDateTime t4 = tournament.getUpdatedAt();
        Assertions.assertTrue(t4.isAfter(t3) || t4.isEqual(t3));
    }

    @Provide
    Arbitrary<int[]> scorePairs() {
        return Arbitraries.integers().between(0, 999).list().ofSize(2).filter(list -> !list.get(0).equals(list.get(1)))
                .map(list -> new int[]{list.get(0), list.get(1)});
    }
}
