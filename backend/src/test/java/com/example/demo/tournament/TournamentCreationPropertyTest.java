package com.example.demo.tournament;

import com.example.demo.dto.TournamentCreateRequest;
import com.example.demo.dto.TournamentResponse;
import com.example.demo.entities.Sport;
import com.example.demo.entities.Tournament;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.SportRepository;
import com.example.demo.repositories.TournamentRepository;
import com.example.demo.services.TournamentServiceImpl;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import net.jqwik.api.*;
import org.junit.jupiter.api.Assertions;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

public class TournamentCreationPropertyTest {

    private final Validator validator;

    public TournamentCreationPropertyTest() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        this.validator = factory.getValidator();
    }

    // Feature: tournament-management, Property 1: Tournament initial state invariant
    @Property(tries = 100)
    void tournamentInitialStateInvariant(
            @ForAll("validNames") String name,
            @ForAll("validLimits") int limit
    ) {
        TournamentRepository tournamentRepo = Mockito.mock(TournamentRepository.class);
        SportRepository sportRepo = Mockito.mock(SportRepository.class);
        TournamentServiceImpl tournamentService = new TournamentServiceImpl(
                tournamentRepo, null, null, sportRepo, null, null, null, null, null
        );

        Sport sport = new Sport("sport-1", "Football", "icon-1", "rules", 11, true);
        Mockito.when(sportRepo.findById("sport-1")).thenReturn(Optional.of(sport));
        Mockito.when(tournamentRepo.save(Mockito.any(Tournament.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        TournamentCreateRequest request = new TournamentCreateRequest(name, "sport-1", limit, LocalDate.now().plusDays(1), LocalDate.now().plusDays(7), null, null);
        TournamentResponse response = tournamentService.create(request);

        Assertions.assertEquals(name, response.getName());
        Assertions.assertEquals("sport-1", response.getSportId());
        Assertions.assertEquals(limit, response.getParticipantLimit());
        Assertions.assertEquals(0, response.getCurrentParticipants());
        Assertions.assertEquals(TournamentStatus.REGISTRATION_OPEN, response.getStatus());
        Assertions.assertNull(response.getChampionId());
        Assertions.assertNull(response.getChampionType());
        Assertions.assertTrue(response.isRegistrationOpen());
        Assertions.assertNotNull(response.getCreatedAt());
        Assertions.assertNotNull(response.getUpdatedAt());
    }

    // Feature: tournament-management, Property 2: participantLimit rejects non-4/8
    @Property(tries = 100)
    void participantLimitRejectsNon4Or8(@ForAll("invalidLimits") int limit) {
        TournamentCreateRequest request = new TournamentCreateRequest("Valid Name", "sport-1", limit, LocalDate.now().plusDays(1), LocalDate.now().plusDays(7), null, null);
        Set<ConstraintViolation<TournamentCreateRequest>> violations = validator.validate(request);
        boolean limitViolationFound = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("participantLimit"));
        Assertions.assertTrue(limitViolationFound, "Participant limit of " + limit + " should be invalid.");
    }

    // Feature: tournament-management, Property 3: Blank name / null date rejected
    @Property(tries = 100)
    void blankNameAndNullDateRejected(
            @ForAll("blankNames") String name,
            @ForAll("validLimits") int limit
    ) {
        TournamentCreateRequest request = new TournamentCreateRequest(name, "sport-1", limit, null, null, null, null);
        Set<ConstraintViolation<TournamentCreateRequest>> violations = validator.validate(request);
        Assertions.assertFalse(violations.isEmpty(), "Blank name or null date must trigger violation.");
    }

    @Provide
    Arbitrary<String> validNames() {
        return Arbitraries.strings().ofMinLength(1).filter(s -> !s.trim().isEmpty());
    }

    @Provide
    Arbitrary<Integer> validLimits() {
        return Arbitraries.of(4, 8);
    }

    @Provide
    Arbitrary<Integer> invalidLimits() {
        return Arbitraries.integers().filter(n -> n != 4 && n != 8);
    }

    @Provide
    Arbitrary<String> blankNames() {
        return Arbitraries.strings().withChars(' ', '\t', '\n').ofMinLength(0);
    }
}
