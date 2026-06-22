package com.example.demo.tournament;

import com.example.demo.dto.BracketResponse;
import com.example.demo.entities.*;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.*;
import com.example.demo.services.BracketServiceImpl;
import net.jqwik.api.*;
import org.junit.jupiter.api.Assertions;
import org.mockito.Mockito;

import java.util.*;

public class BracketPropertyTest {

    // Feature: tournament-management, Property 7: 4-participant bracket structure
    @Property(tries = 100)
    void bracket4ParticipantsStructure(@ForAll("generate4Ids") List<String> participantIds) {
        TournamentRepository tournamentRepo = Mockito.mock(TournamentRepository.class);
        TournamentParticipantRepository tpRepo = Mockito.mock(TournamentParticipantRepository.class);
        TournamentMatchRepository matchRepo = Mockito.mock(TournamentMatchRepository.class);
        SportRepository sportRepo = Mockito.mock(SportRepository.class);

        BracketServiceImpl bracketService = new BracketServiceImpl(
                tournamentRepo, tpRepo, matchRepo, null, null, null, sportRepo
        );

        Tournament tournament = new Tournament();
        tournament.setId("t-1");
        tournament.setSportId("sport-1");
        tournament.setParticipantLimit(4);
        tournament.setStatus(TournamentStatus.READY);

        Sport sport = new Sport("sport-1", "Football", "icon-1", "rules", 11, true);

        List<TournamentParticipant> tpList = new ArrayList<>();
        for (String pid : participantIds) {
            tpList.add(new TournamentParticipant("tp-" + pid, "t-1", pid, ParticipantType.TEAM));
        }

        Mockito.when(tournamentRepo.findById("t-1")).thenReturn(Optional.of(tournament));
        Mockito.when(sportRepo.findById("sport-1")).thenReturn(Optional.of(sport));
        Mockito.when(tpRepo.findByTournamentId("t-1")).thenReturn(tpList);

        List<TournamentMatch> savedMatches = new ArrayList<>();
        Mockito.when(matchRepo.save(Mockito.any(TournamentMatch.class)))
                .thenAnswer(inv -> {
                    TournamentMatch m = inv.getArgument(0);
                    if (m.getId() == null) {
                        m.setId("match-id-" + (savedMatches.size() + 1));
                    }
                    savedMatches.add(m);
                    return m;
                });

        bracketService.generateBracket("t-1");

        Assertions.assertEquals(3, savedMatches.size());

        TournamentMatch finalMatch = savedMatches.stream()
                .filter(m -> m.getRound() == MatchRound.FINAL)
                .findFirst()
                .orElse(null);
        Assertions.assertNotNull(finalMatch);
        Assertions.assertEquals(3, finalMatch.getMatchNumber());
        Assertions.assertEquals(MatchStatus.PENDING, finalMatch.getStatus());
        Assertions.assertNull(finalMatch.getNextMatchId());

        List<TournamentMatch> sfMatches = savedMatches.stream()
                .filter(m -> m.getRound() == MatchRound.SEMI_FINAL)
                .toList();
        Assertions.assertEquals(2, sfMatches.size());

        for (TournamentMatch sf : sfMatches) {
            Assertions.assertEquals(MatchStatus.READY, sf.getStatus());
            Assertions.assertEquals(finalMatch.getId(), sf.getNextMatchId());
            Assertions.assertNotNull(sf.getParticipant1Id());
            Assertions.assertNotNull(sf.getParticipant2Id());
        }
    }

    // Feature: tournament-management, Property 8: 8-participant bracket structure
    @Property(tries = 100)
    void bracket8ParticipantsStructure(@ForAll("generate8Ids") List<String> participantIds) {
        TournamentRepository tournamentRepo = Mockito.mock(TournamentRepository.class);
        TournamentParticipantRepository tpRepo = Mockito.mock(TournamentParticipantRepository.class);
        TournamentMatchRepository matchRepo = Mockito.mock(TournamentMatchRepository.class);
        SportRepository sportRepo = Mockito.mock(SportRepository.class);

        BracketServiceImpl bracketService = new BracketServiceImpl(
                tournamentRepo, tpRepo, matchRepo, null, null, null, sportRepo
        );

        Tournament tournament = new Tournament();
        tournament.setId("t-1");
        tournament.setSportId("sport-1");
        tournament.setParticipantLimit(8);
        tournament.setStatus(TournamentStatus.READY);

        Sport sport = new Sport("sport-1", "Football", "icon-1", "rules", 11, true);

        List<TournamentParticipant> tpList = new ArrayList<>();
        for (String pid : participantIds) {
            tpList.add(new TournamentParticipant("tp-" + pid, "t-1", pid, ParticipantType.TEAM));
        }

        Mockito.when(tournamentRepo.findById("t-1")).thenReturn(Optional.of(tournament));
        Mockito.when(sportRepo.findById("sport-1")).thenReturn(Optional.of(sport));
        Mockito.when(tpRepo.findByTournamentId("t-1")).thenReturn(tpList);

        List<TournamentMatch> savedMatches = new ArrayList<>();
        Mockito.when(matchRepo.save(Mockito.any(TournamentMatch.class)))
                .thenAnswer(inv -> {
                    TournamentMatch m = inv.getArgument(0);
                    if (m.getId() == null) {
                        m.setId("match-id-" + (savedMatches.size() + 1));
                    }
                    savedMatches.add(m);
                    return m;
                });

        bracketService.generateBracket("t-1");

        Assertions.assertEquals(7, savedMatches.size());

        TournamentMatch finalMatch = savedMatches.stream()
                .filter(m -> m.getRound() == MatchRound.FINAL)
                .findFirst()
                .orElse(null);
        Assertions.assertNotNull(finalMatch);
        Assertions.assertEquals(MatchStatus.PENDING, finalMatch.getStatus());

        List<TournamentMatch> sfMatches = savedMatches.stream()
                .filter(m -> m.getRound() == MatchRound.SEMI_FINAL)
                .toList();
        Assertions.assertEquals(2, sfMatches.size());

        for (TournamentMatch sf : sfMatches) {
            Assertions.assertEquals(MatchStatus.PENDING, sf.getStatus());
            Assertions.assertEquals(finalMatch.getId(), sf.getNextMatchId());
            Assertions.assertNull(sf.getParticipant1Id());
            Assertions.assertNull(sf.getParticipant2Id());
        }

        List<TournamentMatch> qfMatches = savedMatches.stream()
                .filter(m -> m.getRound() == MatchRound.QUARTER_FINAL)
                .toList();
        Assertions.assertEquals(4, qfMatches.size());

        for (TournamentMatch qf : qfMatches) {
            Assertions.assertEquals(MatchStatus.READY, qf.getStatus());
            Assertions.assertTrue(qf.getNextMatchId().equals(sfMatches.get(0).getId()) || qf.getNextMatchId().equals(sfMatches.get(1).getId()));
            Assertions.assertNotNull(qf.getParticipant1Id());
            Assertions.assertNotNull(qf.getParticipant2Id());
        }
    }

    // Feature: tournament-management, Property 11: Winner slot advancement
    @Property(tries = 100)
    void winnerSlotAdvancement(
            @ForAll("nextMatchPositions") int nextPosition,
            @ForAll("scorePairs") int[] scores
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
        playedMatch.setId("m-played");
        playedMatch.setTournamentId("t-1");
        playedMatch.setRound(MatchRound.SEMI_FINAL);
        playedMatch.setParticipant1Id("P1");
        playedMatch.setParticipant1Type(ParticipantType.PLAYER);
        playedMatch.setParticipant2Id("P2");
        playedMatch.setParticipant2Type(ParticipantType.PLAYER);
        playedMatch.setScore1(scores[0]);
        playedMatch.setScore2(scores[1]);
        playedMatch.setNextMatchId("m-next");
        playedMatch.setNextMatchPosition(nextPosition);

        TournamentMatch nextMatch = new TournamentMatch();
        nextMatch.setId("m-next");
        nextMatch.setTournamentId("t-1");
        nextMatch.setRound(MatchRound.FINAL);
        nextMatch.setStatus(MatchStatus.PENDING);

        Mockito.when(matchRepo.findById("m-next")).thenReturn(Optional.of(nextMatch));

        bracketService.advanceWinner(playedMatch, tournament);

        String expectedWinner = scores[0] > scores[1] ? "P1" : "P2";

        if (nextPosition == 1) {
            Assertions.assertEquals(expectedWinner, nextMatch.getParticipant1Id());
            Assertions.assertNull(nextMatch.getParticipant2Id());
            Assertions.assertEquals(MatchStatus.PENDING, nextMatch.getStatus());
        } else {
            Assertions.assertEquals(expectedWinner, nextMatch.getParticipant2Id());
            Assertions.assertNull(nextMatch.getParticipant1Id());
            Assertions.assertEquals(MatchStatus.PENDING, nextMatch.getStatus());
        }

        // Now simulate the other semifinal being played to set nextMatch status to READY
        TournamentMatch playedMatch2 = new TournamentMatch();
        playedMatch2.setId("m-played2");
        playedMatch2.setTournamentId("t-1");
        playedMatch2.setRound(MatchRound.SEMI_FINAL);
        playedMatch2.setParticipant1Id("P3");
        playedMatch2.setParticipant1Type(ParticipantType.PLAYER);
        playedMatch2.setParticipant2Id("P4");
        playedMatch2.setParticipant2Type(ParticipantType.PLAYER);
        playedMatch2.setScore1(scores[0]);
        playedMatch2.setScore2(scores[1]);
        playedMatch2.setNextMatchId("m-next");
        playedMatch2.setNextMatchPosition(nextPosition == 1 ? 2 : 1);

        bracketService.advanceWinner(playedMatch2, tournament);
        Assertions.assertEquals(MatchStatus.READY, nextMatch.getStatus());
    }

    // Feature: tournament-management, Property 14: BracketResponse completeness
    @Property(tries = 100)
    void bracketResponseCompleteness(@ForAll("validLimits") int limit) {
        TournamentRepository tournamentRepo = Mockito.mock(TournamentRepository.class);
        TournamentParticipantRepository tpRepo = Mockito.mock(TournamentParticipantRepository.class);
        TournamentMatchRepository matchRepo = Mockito.mock(TournamentMatchRepository.class);
        SportRepository sportRepo = Mockito.mock(SportRepository.class);
        TeamRepository teamRepo = Mockito.mock(TeamRepository.class);

        BracketServiceImpl bracketService = new BracketServiceImpl(
                tournamentRepo, tpRepo, matchRepo, teamRepo, null, null, sportRepo
        );

        Tournament tournament = new Tournament();
        tournament.setId("t-1");
        tournament.setSportId("sport-1");
        tournament.setParticipantLimit(limit);
        tournament.setStatus(TournamentStatus.BRACKET_GENERATED);

        Sport sport = new Sport("sport-1", "Football", "icon-1", "rules", 11, true);

        // Generate full match list
        List<TournamentMatch> matches = new ArrayList<>();
        int finalMatchNum = limit == 4 ? 3 : 7;
        TournamentMatch finalMatch = new TournamentMatch();
        finalMatch.setId("m-final");
        finalMatch.setTournamentId("t-1");
        finalMatch.setRound(MatchRound.FINAL);
        finalMatch.setMatchNumber(finalMatchNum);
        finalMatch.setStatus(MatchStatus.PENDING);
        matches.add(finalMatch);

        if (limit == 4) {
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
            matches.add(sf1);

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
            matches.add(sf2);
        } else {
            TournamentMatch sf1 = new TournamentMatch();
            sf1.setId("m-sf1");
            sf1.setTournamentId("t-1");
            sf1.setRound(MatchRound.SEMI_FINAL);
            sf1.setMatchNumber(5);
            sf1.setNextMatchId("m-final");
            sf1.setNextMatchPosition(1);
            sf1.setStatus(MatchStatus.PENDING);
            matches.add(sf1);

            TournamentMatch sf2 = new TournamentMatch();
            sf2.setId("m-sf2");
            sf2.setTournamentId("t-1");
            sf2.setRound(MatchRound.SEMI_FINAL);
            sf2.setMatchNumber(6);
            sf2.setNextMatchId("m-final");
            sf2.setNextMatchPosition(2);
            sf2.setStatus(MatchStatus.PENDING);
            matches.add(sf2);

            for (int i = 1; i <= 4; i++) {
                TournamentMatch qf = new TournamentMatch();
                qf.setId("m-qf" + i);
                qf.setTournamentId("t-1");
                qf.setRound(MatchRound.QUARTER_FINAL);
                qf.setMatchNumber(i);
                qf.setParticipant1Id("T" + (i * 2 - 1));
                qf.setParticipant1Type(ParticipantType.TEAM);
                qf.setParticipant2Id("T" + (i * 2));
                qf.setParticipant2Type(ParticipantType.TEAM);
                qf.setNextMatchId(i <= 2 ? "m-sf1" : "m-sf2");
                qf.setNextMatchPosition(i % 2 == 1 ? 1 : 2);
                qf.setStatus(MatchStatus.READY);
                matches.add(qf);
            }
        }

        Mockito.when(tournamentRepo.findById("t-1")).thenReturn(Optional.of(tournament));
        Mockito.when(sportRepo.findById("sport-1")).thenReturn(Optional.of(sport));
        Mockito.when(matchRepo.findByTournamentId("t-1")).thenReturn(matches);

        // Mock team resolution
        for (int i = 1; i <= limit; i++) {
            Team team = new Team("T" + i, "Team " + i, "sport-1", "cap-" + i, "logo-" + i, null);
            Mockito.when(teamRepo.findById("T" + i)).thenReturn(Optional.of(team));
        }

        BracketResponse bracket = bracketService.getBracket("t-1");
        Assertions.assertNotNull(bracket);
        Assertions.assertEquals("t-1", bracket.getTournamentId());
        Assertions.assertEquals(ParticipantType.TEAM, bracket.getParticipantType());
        Assertions.assertNotNull(bracket.getFinalMatch());

        if (limit == 4) {
            Assertions.assertNotNull(bracket.getFinalMatch().getSemiFinal1());
            Assertions.assertNotNull(bracket.getFinalMatch().getSemiFinal2());
            Assertions.assertNull(bracket.getFinalMatch().getQuarterFinal1());
            Assertions.assertNull(bracket.getFinalMatch().getQuarterFinal2());
        } else {
            Assertions.assertNotNull(bracket.getFinalMatch().getSemiFinal1());
            Assertions.assertNotNull(bracket.getFinalMatch().getSemiFinal2());
            Assertions.assertNotNull(bracket.getFinalMatch().getSemiFinal1().getQuarterFinal1());
            Assertions.assertNotNull(bracket.getFinalMatch().getSemiFinal1().getQuarterFinal2());
            Assertions.assertNotNull(bracket.getFinalMatch().getSemiFinal2().getQuarterFinal1());
            Assertions.assertNotNull(bracket.getFinalMatch().getSemiFinal2().getQuarterFinal2());
        }
    }

    @Provide
    Arbitrary<List<String>> generate4Ids() {
        return Arbitraries.strings().ofMinLength(1).filter(s -> !s.trim().isEmpty()).list().ofSize(4);
    }

    @Provide
    Arbitrary<List<String>> generate8Ids() {
        return Arbitraries.strings().ofMinLength(1).filter(s -> !s.trim().isEmpty()).list().ofSize(8);
    }

    @Provide
    Arbitrary<Integer> validLimits() {
        return Arbitraries.of(4, 8);
    }

    @Provide
    Arbitrary<Integer> nextMatchPositions() {
        return Arbitraries.of(1, 2);
    }

    @Provide
    Arbitrary<int[]> scorePairs() {
        return Arbitraries.integers().between(0, 999).list().ofSize(2).filter(list -> !list.get(0).equals(list.get(1)))
                .map(list -> new int[]{list.get(0), list.get(1)});
    }
}
