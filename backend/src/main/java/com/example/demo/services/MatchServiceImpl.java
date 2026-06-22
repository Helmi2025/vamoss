package com.example.demo.services;

import com.example.demo.dto.MatchResponse;
import com.example.demo.dto.MatchResultRequest;
import com.example.demo.dto.MatchScheduleRequest;
import com.example.demo.dto.TodayMatchDto;
import com.example.demo.entities.Field;
import com.example.demo.entities.Tournament;
import com.example.demo.entities.TournamentMatch;
import com.example.demo.exceptions.BusinessException;
import com.example.demo.exceptions.ConflictException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.FieldRepository;
import com.example.demo.repositories.TournamentMatchRepository;
import com.example.demo.repositories.TournamentRepository;
import com.example.demo.tournament.MatchStatus;
import com.example.demo.tournament.TournamentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final TournamentMatchRepository tournamentMatchRepository;
    private final TournamentRepository tournamentRepository;
    private final FieldRepository fieldRepository;
    private final BracketService bracketService;

    // For resolving participant names in getTodayMatches()
    private final com.example.demo.repositories.TeamRepository teamRepository;
    private final com.example.demo.repositories.PlayerRepository playerRepository;
    private final com.example.demo.repositories.DoublesTeamRepository doublesTeamRepository;

    @org.springframework.beans.factory.annotation.Value("${app.base-url}")
    private String baseUrl;

    @Override
    public MatchResponse getById(String matchId) {
        TournamentMatch match = tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
        return toResponse(match);
    }

    @Override
    public List<MatchResponse> getByTournamentId(String tournamentId) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        return tournamentMatchRepository.findByTournamentId(tournamentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MatchResponse recordResult(String matchId, MatchResultRequest request) {
        TournamentMatch match = tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (match.getStatus() == MatchStatus.PENDING) {
            throw new BusinessException("Match is not ready to receive results");
        }

        if (match.getScheduledDate() == null || match.getFieldId() == null) {
            throw new BusinessException("Match must be scheduled on a field and date before recording a result");
        }

        if (request.getScore1() == request.getScore2()) {
            throw new BusinessException("Draws are not permitted in single-elimination tournaments");
        }

        match.setScore1(request.getScore1());
        match.setScore2(request.getScore2());

        Tournament tournament = tournamentRepository.findById(match.getTournamentId())
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        bracketService.advanceWinner(match, tournament);

        // Fetch updated match state
        TournamentMatch updatedMatch = tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        return toResponse(updatedMatch);
    }

    @Override
    public MatchResponse scheduleMatch(String matchId, MatchScheduleRequest request) {
        TournamentMatch match = tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        Tournament tournament = tournamentRepository.findById(match.getTournamentId())
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        // Bracket must exist before scheduling
        TournamentStatus ts = tournament.getStatus();
        if (ts != TournamentStatus.BRACKET_GENERATED
                && ts != TournamentStatus.IN_PROGRESS
                && ts != TournamentStatus.COMPLETED) {
            throw new ConflictException("Match scheduling is not available until the bracket has been generated");
        }

        // Validate field exists
        Field newField = fieldRepository.findById(request.getFieldId())
                .orElseThrow(() -> new ResourceNotFoundException("Field not found"));

        // Field must be for the same sport
        if (!newField.getSportId().equals(tournament.getSportId())) {
            throw new BusinessException("Field sport does not match tournament sport");
        }

        LocalDateTime dt = request.getScheduledDateTime();
        LocalDate startDate = tournament.getStartDate();
        LocalDate endDate   = tournament.getEndDate();

        // scheduledDateTime must fall within tournament date range
        if (startDate != null && dt.toLocalDate().isBefore(startDate)) {
            throw new BusinessException("Scheduled date/time must fall within the tournament date range");
        }
        if (endDate != null && dt.toLocalDate().isAfter(endDate)) {
            throw new BusinessException("Scheduled date/time must fall within the tournament date range");
        }

        // ── 2-hour window overlap check ──
        // Another match on the same field conflicts if its start time falls within
        // [dt - 2h, dt + 2h) — i.e. its window overlaps with the requested window.
        LocalDateTime windowStart = dt.minusHours(2);
        LocalDateTime windowEnd   = dt.plusHours(2);
        boolean conflict = tournamentMatchRepository
                .existsByFieldIdAndScheduledDateBetweenAndIdNot(
                        request.getFieldId(), windowStart, windowEnd, matchId);
        if (conflict) {
            throw new ConflictException(
                    "The selected field is already booked within 2 hours of the requested date/time");
        }

        // ── Field availability flag (manual admin toggle — not time-based) ──
        // isAvailable=false means the field is closed/disabled by an admin (e.g. maintenance).
        // Time-slot availability is handled exclusively by the 2-hour overlap check above.
        if (!newField.isAvailable()) {
            throw new BusinessException("The selected field is not available");
        }

        match.setScheduledDate(dt);
        match.setFieldId(request.getFieldId());
        // Both date and field are now set — mark the match as READY to accept results
        if (match.getParticipant1Id() != null && match.getParticipant2Id() != null) {
            match.setStatus(MatchStatus.READY);
        }
        tournamentMatchRepository.save(match);

        return toResponse(match);
    }

    @Override
    public List<TodayMatchDto> getTodayMatches() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = startOfDay.plusDays(1).minusNanos(1);

        List<TournamentMatch> todayMatches = tournamentMatchRepository
                .findByScheduledDateBetween(startOfDay, endOfDay);

        return enrichMatches(todayMatches);
    }

    @Override
    public List<TodayMatchDto> getFutureMatches() {
        LocalDateTime startOfTomorrow = LocalDate.now().plusDays(1).atStartOfDay();

        List<TournamentMatch> futureMatches = tournamentMatchRepository
                .findByScheduledDateAfterOrderByScheduledDateAsc(startOfTomorrow);

        return enrichMatches(futureMatches);
    }

    @Override
    public List<TodayMatchDto> getPastMatches() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();

        List<TournamentMatch> pastMatches = tournamentMatchRepository
                .findByScheduledDateBeforeOrderByScheduledDateDesc(startOfToday);

        return enrichMatches(pastMatches);
    }

    /** Shared enrichment: resolves tournament name, sportId, and participant names/logos. */
    private List<TodayMatchDto> enrichMatches(List<TournamentMatch> rawMatches) {
        Map<String, Tournament> tournamentMap = tournamentRepository.findAll().stream()
                .collect(Collectors.toMap(Tournament::getId, t -> t));

        return rawMatches.stream()
                .map(m -> {
                    Tournament t = tournamentMap.get(m.getTournamentId());
                    String tournamentName = t != null ? t.getName() : "Unknown Tournament";
                    String sportId = t != null ? t.getSportId() : null;

                    return new TodayMatchDto(
                            m.getId(),
                            m.getTournamentId(),
                            tournamentName,
                            sportId,
                            m.getRound(),
                            m.getMatchNumber(),
                            m.getParticipant1Id(),
                            m.getParticipant1Type(),
                            resolveParticipantName(m.getParticipant1Id(), m.getParticipant1Type()),
                            resolveParticipantLogo(m.getParticipant1Id(), m.getParticipant1Type()),
                            m.getParticipant2Id(),
                            m.getParticipant2Type(),
                            resolveParticipantName(m.getParticipant2Id(), m.getParticipant2Type()),
                            resolveParticipantLogo(m.getParticipant2Id(), m.getParticipant2Type()),
                            m.getScore1(),
                            m.getScore2(),
                            m.getWinnerId(),
                            m.getStatus(),
                            m.getScheduledDate(),
                            m.getFieldId()
                    );
                })
                .collect(Collectors.toList());
    }

    private String resolveParticipantName(String id, com.example.demo.tournament.ParticipantType type) {
        if (id == null || type == null) return "TBD";
        switch (type) {
            case TEAM:
                return teamRepository.findById(id)
                        .map(com.example.demo.entities.Team::getTeamName)
                        .orElse("Unknown Team");
            case PLAYER:
                return playerRepository.findById(id)
                        .map(com.example.demo.entities.Player::getFullName)
                        .orElse("Unknown Player");
            case DOUBLES_TEAM:
                return doublesTeamRepository.findById(id)
                        .map(com.example.demo.entities.DoublesTeam::getTeamName)
                        .orElse("Unknown Pair");
            default:
                return "Unknown";
        }
    }

    private String resolveParticipantLogo(String id, com.example.demo.tournament.ParticipantType type) {
        if (id == null || type == null) return null;
        switch (type) {
            case TEAM:
                return teamRepository.findById(id)
                        .map(t -> t.getLogoFileId() != null ? baseUrl + "/api/captain/team/logo/" + t.getLogoFileId() : null)
                        .orElse(null);
            case PLAYER:
                return playerRepository.findById(id)
                        .map(com.example.demo.entities.Player::getPhotoUrl)
                        .orElse(null);
            case DOUBLES_TEAM:
                return doublesTeamRepository.findById(id)
                        .flatMap(dt -> dt.getPlayer1Id() != null
                                ? playerRepository.findById(dt.getPlayer1Id()).map(com.example.demo.entities.Player::getPhotoUrl)
                                : java.util.Optional.empty())
                        .orElse(null);
            default:
                return null;
        }
    }

    private MatchResponse toResponse(TournamentMatch m) {
        return new MatchResponse(
                m.getId(),
                m.getTournamentId(),
                m.getRound(),
                m.getMatchNumber(),
                m.getParticipant1Id(),
                m.getParticipant1Type(),
                m.getParticipant2Id(),
                m.getParticipant2Type(),
                m.getScore1(),
                m.getScore2(),
                m.getWinnerId(),
                m.getWinnerType(),
                m.getStatus(),
                m.getNextMatchId(),
                m.getNextMatchPosition(),
                m.getScheduledDate(),
                m.getFieldId(),
                m.getCreatedAt()
        );
    }
}
