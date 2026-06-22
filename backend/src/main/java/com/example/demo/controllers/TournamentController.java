package com.example.demo.controllers;

import com.example.demo.dto.*;
import com.example.demo.services.BracketService;
import com.example.demo.services.MatchService;
import com.example.demo.services.TournamentService;
import com.example.demo.tournament.TournamentStatus;
import com.example.demo.exceptions.BusinessException;
import com.example.demo.exceptions.ConflictException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;
    private final BracketService bracketService;
    private final MatchService matchService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public TournamentResponse create(@Valid @RequestBody TournamentCreateRequest request) {
        return tournamentService.create(request);
    }

    @GetMapping
    public List<TournamentResponse> getAll() {
        return tournamentService.getAll();
    }

    @GetMapping("/{id}")
    public TournamentResponse getById(@PathVariable String id) {
        return tournamentService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TournamentResponse update(@PathVariable String id, @Valid @RequestBody TournamentUpdateRequest request) {
        return tournamentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void cancel(@PathVariable String id) {
        tournamentService.cancel(id);
    }

    @DeleteMapping("/{id}/delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        tournamentService.delete(id);
    }

    @PostMapping("/{id}/register-team")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CAPTAIN')")
    public TournamentParticipantResponse registerTeam(@PathVariable String id, @Valid @RequestBody RegisterTeamRequest request) {
        return tournamentService.registerTeam(id, request);
    }

    @DeleteMapping("/{id}/unregister-team")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('CAPTAIN')")
    public void unregisterTeam(@PathVariable String id, @Valid @RequestBody UnregisterTeamRequest request) {
        tournamentService.unregisterTeam(id, request.getCaptainId());
    }

    @PostMapping("/{id}/register-player")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PLAYER')")
    public TournamentParticipantResponse registerPlayer(@PathVariable String id, @Valid @RequestBody RegisterPlayerRequest request) {
        return tournamentService.registerPlayer(id, request);
    }

    @DeleteMapping("/{id}/unregister-player")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PLAYER')")
    public void unregisterPlayer(@PathVariable String id, @RequestParam String playerId) {
        tournamentService.unregisterPlayer(id, playerId);
    }

    @PostMapping("/{id}/register-doubles")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PLAYER')")
    public DoublesTeamResponse registerDoubles(@PathVariable String id, @Valid @RequestBody RegisterDoublesRequest request) {
        return tournamentService.registerDoubles(id, request);
    }

    /**
     * GET /api/tournaments/{id}/eligible-partners?playerId=
     * Returns friends of the player that are eligible partners for this doubles tournament
     * (correct gender, not yet registered).
     */
    @GetMapping("/{id}/eligible-partners")
    @PreAuthorize("hasRole('PLAYER')")
    public List<EligibleFriendDto> getEligiblePartners(@PathVariable String id, @RequestParam String playerId) {
        return tournamentService.getEligiblePartners(id, playerId);
    }

    /**
     * GET /api/tournaments/{id}/my-doubles-team?playerId=
     * Returns the DoublesTeam the player is registered in for this tournament, or 404.
     */
    @GetMapping("/{id}/my-doubles-team")
    @PreAuthorize("hasRole('PLAYER')")
    public DoublesTeamResponse getMyDoublesTeam(@PathVariable String id, @RequestParam String playerId) {
        return tournamentService.getMyDoublesTeam(id, playerId);
    }

    @DeleteMapping("/{id}/participants/{participantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void removeParticipant(@PathVariable String id, @PathVariable String participantId) {
        tournamentService.removeParticipant(id, participantId);
    }

    @GetMapping("/{id}/participants")
    public List<TournamentParticipantResponse> getParticipants(@PathVariable String id) {
        return tournamentService.getParticipants(id);
    }

    @GetMapping("/{id}/participants/details")
    public List<BracketResponse.ParticipantSummary> getParticipantDetails(@PathVariable String id) {
        return tournamentService.getParticipantDetails(id);
    }

    @PostMapping("/{id}/generate-bracket")
    @PreAuthorize("hasRole('ADMIN')")
    public void generateBracket(@PathVariable String id) {
        TournamentResponse tournament = tournamentService.getById(id);
        if (tournament.getStatus() == TournamentStatus.BRACKET_GENERATED ||
                tournament.getStatus() == TournamentStatus.IN_PROGRESS ||
                tournament.getStatus() == TournamentStatus.COMPLETED) {
            throw new ConflictException("Bracket has already been generated");
        }
        if (tournament.getStatus() != TournamentStatus.READY) {
            throw new BusinessException("Tournament is not full yet");
        }
        bracketService.generateBracket(id);
    }

    @GetMapping("/{id}/bracket")
    public BracketResponse getBracket(@PathVariable String id) {
        return bracketService.getBracket(id);
    }

    @GetMapping("/{id}/matches")
    public List<MatchResponse> getMatches(@PathVariable String id) {
        return matchService.getByTournamentId(id);
    }
}
