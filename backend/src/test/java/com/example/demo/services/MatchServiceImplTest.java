package com.example.demo.services;

import com.example.demo.dto.*;
import com.example.demo.entities.*;
import com.example.demo.exceptions.BusinessException;
import com.example.demo.exceptions.ConflictException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.*;
import com.example.demo.tournament.MatchStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class MatchServiceImplTest {

    @Mock private TournamentMatchRepository tournamentMatchRepository;
    @Mock private TournamentRepository tournamentRepository;
    @Mock private BracketService bracketService;

    @InjectMocks
    private MatchServiceImpl matchService;

    @Test
    void testMatchNotFound() {
        Mockito.when(tournamentMatchRepository.findById("m-1")).thenReturn(Optional.empty());
        MatchResultRequest req = new MatchResultRequest(1, 0);
        Assertions.assertThrows(ResourceNotFoundException.class, () -> matchService.recordResult("m-1", req));
    }

    @Test
    void testMatchAlreadyPlayed() {
        TournamentMatch match = new TournamentMatch();
        match.setStatus(MatchStatus.PLAYED);
        Mockito.when(tournamentMatchRepository.findById("m-1")).thenReturn(Optional.of(match));

        MatchResultRequest req = new MatchResultRequest(2, 1);
        Assertions.assertThrows(ConflictException.class, () -> matchService.recordResult("m-1", req));
    }

    @Test
    void testMatchPending() {
        TournamentMatch match = new TournamentMatch();
        match.setStatus(MatchStatus.PENDING);
        Mockito.when(tournamentMatchRepository.findById("m-1")).thenReturn(Optional.of(match));

        MatchResultRequest req = new MatchResultRequest(2, 1);
        Assertions.assertThrows(BusinessException.class, () -> matchService.recordResult("m-1", req));
    }

    @Test
    void testDrawNotPermitted() {
        TournamentMatch match = new TournamentMatch();
        match.setStatus(MatchStatus.READY);
        Mockito.when(tournamentMatchRepository.findById("m-1")).thenReturn(Optional.of(match));

        MatchResultRequest req = new MatchResultRequest(2, 2);
        Assertions.assertThrows(BusinessException.class, () -> matchService.recordResult("m-1", req));
    }

    @Test
    void testRecordResultSuccess() {
        TournamentMatch match = new TournamentMatch();
        match.setId("m-1");
        match.setTournamentId("t-1");
        match.setStatus(MatchStatus.READY);

        Tournament tournament = new Tournament();
        tournament.setId("t-1");

        Mockito.when(tournamentMatchRepository.findById("m-1")).thenReturn(Optional.of(match));
        Mockito.when(tournamentRepository.findById("t-1")).thenReturn(Optional.of(tournament));

        MatchResultRequest req = new MatchResultRequest(3, 1);
        matchService.recordResult("m-1", req);

        Assertions.assertEquals(3, match.getScore1());
        Assertions.assertEquals(1, match.getScore2());
        Mockito.verify(bracketService).advanceWinner(match, tournament);
    }
}
