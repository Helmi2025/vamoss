package com.example.demo.tournament;

import com.example.demo.dto.RegisterPlayerRequest;
import com.example.demo.dto.RegisterTeamRequest;
import com.example.demo.entities.*;
import com.example.demo.exceptions.BusinessException;
import com.example.demo.exceptions.ConflictException;
import com.example.demo.repositories.*;
import com.example.demo.services.BracketService;
import com.example.demo.services.TournamentServiceImpl;
import net.jqwik.api.*;
import org.junit.jupiter.api.Assertions;
import org.mockito.Mockito;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

public class RegistrationPropertyTest {

    // Feature: tournament-management, Property 4: Registration increments and deduplicates
    @Property(tries = 100)
    void registrationIncrementsAndDeduplicates(@ForAll("validParticipantIds") String teamId) {
        TournamentRepository tournamentRepo = Mockito.mock(TournamentRepository.class);
        TournamentParticipantRepository tpRepo = Mockito.mock(TournamentParticipantRepository.class);
        SportRepository sportRepo = Mockito.mock(SportRepository.class);
        TeamRepository teamRepo = Mockito.mock(TeamRepository.class);
        BracketService bracketService = Mockito.mock(BracketService.class);

        TournamentServiceImpl tournamentService = new TournamentServiceImpl(
                tournamentRepo, tpRepo, null, sportRepo, teamRepo, null, null, null, bracketService
        );

        Tournament tournament = new Tournament();
        tournament.setId("t-1");
        tournament.setSportId("sport-1");
        tournament.setParticipantLimit(4);
        tournament.setCurrentParticipants(0);
        tournament.setStatus(TournamentStatus.REGISTRATION_OPEN);
        tournament.setRegistrationOpen(true);

        Sport sport = new Sport("sport-1", "Football", "icon-1", "rules", 11, true);
        Team team = new Team("team-id", "The Teams", "sport-1", "captain-1", "logo-1", null);

        Mockito.when(tournamentRepo.findById("t-1")).thenReturn(Optional.of(tournament));
        Mockito.when(sportRepo.findById("sport-1")).thenReturn(Optional.of(sport));
        Mockito.when(teamRepo.findById(teamId)).thenReturn(Optional.of(team));

        Set<String> registered = new HashSet<>();
        Mockito.when(tpRepo.existsByTournamentIdAndParticipantId("t-1", teamId))
                .thenAnswer(inv -> registered.contains(teamId));
        Mockito.when(tpRepo.save(Mockito.any(TournamentParticipant.class)))
                .thenAnswer(inv -> {
                    TournamentParticipant tp = inv.getArgument(0);
                    registered.add(tp.getParticipantId());
                    return tp;
                });

        // First registration
        int countBefore = tournament.getCurrentParticipants();
        tournamentService.registerTeam("t-1", new RegisterTeamRequest(teamId));
        Assertions.assertEquals(countBefore + 1, tournament.getCurrentParticipants());

        // Duplicate registration should throw ConflictException
        Assertions.assertThrows(ConflictException.class, () -> {
            tournamentService.registerTeam("t-1", new RegisterTeamRequest(teamId));
        });
    }

    // Feature: tournament-management, Property 5: Sport mismatch rejected
    @Property(tries = 100)
    void sportMismatchRejected(
            @ForAll("validParticipantIds") String teamId,
            @ForAll("mismatchedSportIds") String mismatchedSportId
    ) {
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

        Sport sport = new Sport("sport-1", "Football", "icon-1", "rules", 11, true);
        Team team = new Team(teamId, "Team Mismatch", mismatchedSportId, "captain-1", "logo-1", null);

        Mockito.when(tournamentRepo.findById("t-1")).thenReturn(Optional.of(tournament));
        Mockito.when(sportRepo.findById("sport-1")).thenReturn(Optional.of(sport));
        Mockito.when(teamRepo.findById(teamId)).thenReturn(Optional.of(team));

        BusinessException ex = Assertions.assertThrows(BusinessException.class, () -> {
            tournamentService.registerTeam("t-1", new RegisterTeamRequest(teamId));
        });
        Assertions.assertEquals("Participant sport does not match tournament sport", ex.getMessage());
    }

    // Feature: tournament-management, Property 6: Full -> closed; removal -> reopened
    @Property(tries = 100)
    void fullClosedAndRemovalReopened(@ForAll("validLimits") int limit) {
        TournamentRepository tournamentRepo = Mockito.mock(TournamentRepository.class);
        TournamentParticipantRepository tpRepo = Mockito.mock(TournamentParticipantRepository.class);
        SportRepository sportRepo = Mockito.mock(SportRepository.class);
        PlayerRepository playerRepo = Mockito.mock(PlayerRepository.class);
        BracketService bracketService = Mockito.mock(BracketService.class);

        TournamentServiceImpl tournamentService = new TournamentServiceImpl(
                tournamentRepo, tpRepo, null, sportRepo, null, playerRepo, null, null, bracketService
        );

        Tournament tournament = new Tournament();
        tournament.setId("t-1");
        tournament.setSportId("sport-1");
        tournament.setParticipantLimit(limit);
        tournament.setCurrentParticipants(limit - 1);
        tournament.setStatus(TournamentStatus.REGISTRATION_OPEN);
        tournament.setRegistrationOpen(true);

        Sport sport = new Sport("sport-1", "Tennis", "icon-1", "rules", 1, false); // individual sport
        Player player = new Player();
        player.setUserId("player-last");
        player.setSportId("sport-1");

        Mockito.when(tournamentRepo.findById("t-1")).thenReturn(Optional.of(tournament));
        Mockito.when(sportRepo.findById("sport-1")).thenReturn(Optional.of(sport));
        Mockito.when(playerRepo.findById("player-last")).thenReturn(Optional.of(player));
        Mockito.when(tpRepo.existsByTournamentIdAndParticipantId("t-1", "player-last")).thenReturn(false);
        Mockito.when(tpRepo.save(Mockito.any(TournamentParticipant.class))).thenAnswer(inv -> inv.getArgument(0));

        // Register the final participant
        tournamentService.registerPlayer("t-1", new RegisterPlayerRequest("player-last"));
        Assertions.assertEquals(limit, tournament.getCurrentParticipants());
        Assertions.assertFalse(tournament.isRegistrationOpen());
        Assertions.assertEquals(TournamentStatus.READY, tournament.getStatus());

        // Verify bracketService auto-triggered
        Mockito.verify(bracketService).generateBracket("t-1");

        // Now remove the participant
        Mockito.when(tpRepo.existsByTournamentIdAndParticipantId("t-1", "player-last")).thenReturn(true);
        tournamentService.removeParticipant("t-1", "player-last");

        Assertions.assertEquals(limit - 1, tournament.getCurrentParticipants());
        Assertions.assertTrue(tournament.isRegistrationOpen());
        Assertions.assertEquals(TournamentStatus.REGISTRATION_OPEN, tournament.getStatus());
    }

    @Provide
    Arbitrary<String> validParticipantIds() {
        return Arbitraries.strings().ofMinLength(1).filter(s -> !s.trim().isEmpty());
    }

    @Provide
    Arbitrary<String> mismatchedSportIds() {
        return Arbitraries.strings().ofMinLength(1).filter(s -> !s.equals("sport-1"));
    }

    @Provide
    Arbitrary<Integer> validLimits() {
        return Arbitraries.of(4, 8);
    }
}
