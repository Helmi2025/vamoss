package com.example.demo.services;

import com.example.demo.entities.*;
import com.example.demo.repositories.*;
import com.example.demo.tournament.MatchRound;
import com.example.demo.tournament.MatchStatus;
import com.example.demo.tournament.ParticipantType;
import com.example.demo.tournament.TournamentStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class BracketServiceImplTest {

    @Mock private TournamentRepository tournamentRepository;
    @Mock private TournamentParticipantRepository tournamentParticipantRepository;
    @Mock private TournamentMatchRepository tournamentMatchRepository;
    @Mock private TeamRepository teamRepository;
    @Mock private PlayerRepository playerRepository;
    @Mock private SportRepository sportRepository;

    @InjectMocks
    private BracketServiceImpl bracketService;

    @Test
    void test4ParticipantBracketGeneration() {
        Tournament t = new Tournament();
        t.setId("t-1");
        t.setSportId("sport-1");
        t.setParticipantLimit(4);
        t.setStatus(TournamentStatus.READY);

        Sport sport = new Sport("sport-1", "Football", "icon-1", "rules", 11, true);

        List<TournamentParticipant> participants = List.of(
                new TournamentParticipant("tp-1", "t-1", "T1", ParticipantType.TEAM),
                new TournamentParticipant("tp-2", "t-1", "T2", ParticipantType.TEAM),
                new TournamentParticipant("tp-3", "t-1", "T3", ParticipantType.TEAM),
                new TournamentParticipant("tp-4", "t-1", "T4", ParticipantType.TEAM)
        );

        Mockito.when(tournamentRepository.findById("t-1")).thenReturn(Optional.of(t));
        Mockito.when(sportRepository.findById("sport-1")).thenReturn(Optional.of(sport));
        Mockito.when(tournamentParticipantRepository.findByTournamentId("t-1")).thenReturn(participants);

        List<TournamentMatch> savedMatches = new ArrayList<>();
        Mockito.when(tournamentMatchRepository.save(Mockito.any(TournamentMatch.class)))
                .thenAnswer(inv -> {
                    TournamentMatch m = inv.getArgument(0);
                    if (m.getId() == null) {
                        m.setId("match-" + (savedMatches.size() + 1));
                    }
                    savedMatches.add(m);
                    return m;
                });

        bracketService.generateBracket("t-1");

        Assertions.assertEquals(3, savedMatches.size());
        TournamentMatch finalMatch = savedMatches.stream().filter(m -> m.getRound() == MatchRound.FINAL).findFirst().orElse(null);
        Assertions.assertNotNull(finalMatch);
        Assertions.assertEquals(MatchStatus.PENDING, finalMatch.getStatus());

        List<TournamentMatch> sfMatches = savedMatches.stream().filter(m -> m.getRound() == MatchRound.SEMI_FINAL).toList();
        Assertions.assertEquals(2, sfMatches.size());
        for (TournamentMatch sf : sfMatches) {
            Assertions.assertEquals(finalMatch.getId(), sf.getNextMatchId());
            Assertions.assertEquals(MatchStatus.READY, sf.getStatus());
        }
    }

    @Test
    void testAdvanceWinnerPosition1() {
        Tournament t = new Tournament();
        t.setId("t-1");
        t.setStatus(TournamentStatus.BRACKET_GENERATED);

        TournamentMatch playedMatch = new TournamentMatch();
        playedMatch.setId("m-sf1");
        playedMatch.setRound(MatchRound.SEMI_FINAL);
        playedMatch.setParticipant1Id("T1");
        playedMatch.setParticipant1Type(ParticipantType.TEAM);
        playedMatch.setParticipant2Id("T2");
        playedMatch.setParticipant2Type(ParticipantType.TEAM);
        playedMatch.setScore1(3);
        playedMatch.setScore2(1);
        playedMatch.setNextMatchId("m-final");
        playedMatch.setNextMatchPosition(1);

        TournamentMatch nextMatch = new TournamentMatch();
        nextMatch.setId("m-final");
        nextMatch.setStatus(MatchStatus.PENDING);

        Mockito.when(tournamentMatchRepository.findById("m-final")).thenReturn(Optional.of(nextMatch));

        bracketService.advanceWinner(playedMatch, t);

        Assertions.assertEquals("T1", nextMatch.getParticipant1Id());
        Assertions.assertNull(nextMatch.getParticipant2Id());
        Assertions.assertEquals(MatchStatus.PENDING, nextMatch.getStatus());
        Assertions.assertEquals(TournamentStatus.IN_PROGRESS, t.getStatus());
    }

    @Test
    void testAdvanceWinnerPosition2() {
        Tournament t = new Tournament();
        t.setId("t-1");
        t.setStatus(TournamentStatus.IN_PROGRESS);

        TournamentMatch playedMatch = new TournamentMatch();
        playedMatch.setId("m-sf2");
        playedMatch.setRound(MatchRound.SEMI_FINAL);
        playedMatch.setParticipant1Id("T3");
        playedMatch.setParticipant1Type(ParticipantType.TEAM);
        playedMatch.setParticipant2Id("T4");
        playedMatch.setParticipant2Type(ParticipantType.TEAM);
        playedMatch.setScore1(2);
        playedMatch.setScore2(4);
        playedMatch.setNextMatchId("m-final");
        playedMatch.setNextMatchPosition(2);

        TournamentMatch nextMatch = new TournamentMatch();
        nextMatch.setId("m-final");
        nextMatch.setParticipant1Id("T1"); // Already set by SF1
        nextMatch.setParticipant1Type(ParticipantType.TEAM);
        nextMatch.setStatus(MatchStatus.PENDING);

        Mockito.when(tournamentMatchRepository.findById("m-final")).thenReturn(Optional.of(nextMatch));

        bracketService.advanceWinner(playedMatch, t);

        Assertions.assertEquals("T4", nextMatch.getParticipant2Id());
        Assertions.assertEquals(MatchStatus.READY, nextMatch.getStatus());
    }

    @Test
    void testAdvanceWinnerFinal() {
        Tournament t = new Tournament();
        t.setId("t-1");
        t.setStatus(TournamentStatus.IN_PROGRESS);

        TournamentMatch playedMatch = new TournamentMatch();
        playedMatch.setId("m-final");
        playedMatch.setRound(MatchRound.FINAL);
        playedMatch.setParticipant1Id("T1");
        playedMatch.setParticipant1Type(ParticipantType.TEAM);
        playedMatch.setParticipant2Id("T4");
        playedMatch.setParticipant2Type(ParticipantType.TEAM);
        playedMatch.setScore1(5);
        playedMatch.setScore2(2);

        bracketService.advanceWinner(playedMatch, t);

        Assertions.assertEquals(TournamentStatus.COMPLETED, t.getStatus());
        Assertions.assertEquals("T1", t.getChampionId());
        Assertions.assertEquals(ParticipantType.TEAM, t.getChampionType());
        Assertions.assertFalse(t.isRegistrationOpen());
    }
}
