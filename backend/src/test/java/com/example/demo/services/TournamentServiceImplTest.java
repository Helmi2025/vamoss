package com.example.demo.services;

import com.example.demo.dto.*;
import com.example.demo.entities.*;
import com.example.demo.exceptions.BusinessException;
import com.example.demo.exceptions.ConflictException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.*;
import com.example.demo.tournament.TournamentStatus;import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class TournamentServiceImplTest {

    @Mock private TournamentRepository tournamentRepository;
    @Mock private TournamentParticipantRepository tournamentParticipantRepository;
    @Mock private DoublesTeamRepository doublesTeamRepository;
    @Mock private SportRepository sportRepository;
    @Mock private TeamRepository teamRepository;
    @Mock private PlayerRepository playerRepository;
    @Mock private FriendRequestRepository friendRequestRepository;
    @Mock private BracketService bracketService;

    @InjectMocks
    private TournamentServiceImpl tournamentService;

    @Test
    void testSportNotFoundOnCreate() {
        Mockito.when(sportRepository.findById("sport-1")).thenReturn(Optional.empty());
        TournamentCreateRequest req = new TournamentCreateRequest("Name", "sport-1", 4, null, null, null, null);
        Assertions.assertThrows(ResourceNotFoundException.class, () -> tournamentService.create(req));
    }

    @Test
    void testRegistrationClosed() {
        Tournament t = new Tournament();
        t.setRegistrationOpen(false);
        Mockito.when(tournamentRepository.findById("t-1")).thenReturn(Optional.of(t));

        RegisterTeamRequest req = new RegisterTeamRequest("team-1");
        BusinessException ex = Assertions.assertThrows(BusinessException.class, () -> tournamentService.registerTeam("t-1", req));
        Assertions.assertEquals("Registration is closed for this tournament", ex.getMessage());
    }

    @Test
    void testSportTypeMismatch() {
        Tournament t = new Tournament();
        t.setSportId("sport-1");
        t.setRegistrationOpen(true);
        Mockito.when(tournamentRepository.findById("t-1")).thenReturn(Optional.of(t));

        Sport sport = new Sport("sport-1", "Tennis", "icon-1", "rules", 1, false); // individual sport
        Mockito.when(sportRepository.findById("sport-1")).thenReturn(Optional.of(sport));

        RegisterTeamRequest req = new RegisterTeamRequest("team-1");
        BusinessException ex = Assertions.assertThrows(BusinessException.class, () -> tournamentService.registerTeam("t-1", req));
        Assertions.assertEquals("This tournament only accepts individual players", ex.getMessage());
    }

    @Test
    void testSportIdMismatch() {
        Tournament t = new Tournament();
        t.setSportId("sport-1");
        t.setRegistrationOpen(true);
        Mockito.when(tournamentRepository.findById("t-1")).thenReturn(Optional.of(t));

        Sport sport = new Sport("sport-1", "Football", "icon-1", "rules", 11, true);
        Mockito.when(sportRepository.findById("sport-1")).thenReturn(Optional.of(sport));

        Team team = new Team("team-1", "Team 1", "sport-different", "cap-1", "logo-1", null);
        Mockito.when(teamRepository.findById("team-1")).thenReturn(Optional.of(team));

        RegisterTeamRequest req = new RegisterTeamRequest("team-1");
        BusinessException ex = Assertions.assertThrows(BusinessException.class, () -> tournamentService.registerTeam("t-1", req));
        Assertions.assertEquals("Participant sport does not match tournament sport", ex.getMessage());
    }

    @Test
    void testDuplicateRegistration() {
        Tournament t = new Tournament();
        t.setSportId("sport-1");
        t.setRegistrationOpen(true);
        Mockito.when(tournamentRepository.findById("t-1")).thenReturn(Optional.of(t));

        Sport sport = new Sport("sport-1", "Football", "icon-1", "rules", 11, true);
        Mockito.when(sportRepository.findById("sport-1")).thenReturn(Optional.of(sport));

        Team team = new Team("team-1", "Team 1", "sport-1", "cap-1", "logo-1", null);
        Mockito.when(teamRepository.findById("team-1")).thenReturn(Optional.of(team));

        Mockito.when(tournamentParticipantRepository.existsByTournamentIdAndParticipantId("t-1", "team-1")).thenReturn(true);

        RegisterTeamRequest req = new RegisterTeamRequest("team-1");
        ConflictException ex = Assertions.assertThrows(ConflictException.class, () -> tournamentService.registerTeam("t-1", req));
        Assertions.assertEquals("Participant is already registered", ex.getMessage());
    }

    @Test
    void testUpdateCompletedTournament() {
        Tournament t = new Tournament();
        t.setStatus(TournamentStatus.COMPLETED);
        Mockito.when(tournamentRepository.findById("t-1")).thenReturn(Optional.of(t));

        TournamentUpdateRequest req = new TournamentUpdateRequest("Name", null, null);
        Assertions.assertThrows(ConflictException.class, () -> tournamentService.update("t-1", req));
    }

    @Test
    void testCancelCompletedTournament() {
        Tournament t = new Tournament();
        t.setStatus(TournamentStatus.COMPLETED);
        Mockito.when(tournamentRepository.findById("t-1")).thenReturn(Optional.of(t));

        Assertions.assertThrows(ConflictException.class, () -> tournamentService.cancel("t-1"));
    }
}
