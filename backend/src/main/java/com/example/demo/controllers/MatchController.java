package com.example.demo.controllers;

import com.example.demo.dto.MatchResponse;
import com.example.demo.dto.MatchResultRequest;
import com.example.demo.dto.MatchScheduleRequest;
import com.example.demo.dto.TodayMatchDto;
import com.example.demo.services.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    /**
     * GET /api/matches/today
     * Returns all matches scheduled for today (across all tournaments),
     * enriched with tournament name, sport ID, and participant names.
     */
    @GetMapping("/today")
    public List<TodayMatchDto> getTodayMatches() {
        return matchService.getTodayMatches();
    }

    /**
     * GET /api/matches/upcoming
     * Returns all matches scheduled after today, sorted by date ascending.
     */
    @GetMapping("/upcoming")
    public List<TodayMatchDto> getUpcomingMatches() {
        return matchService.getFutureMatches();
    }

    /**
     * GET /api/matches/past
     * Returns all matches scheduled before today (already played), sorted by date descending.
     */
    @GetMapping("/past")
    public List<TodayMatchDto> getPastMatches() {
        return matchService.getPastMatches();
    }

    @GetMapping("/{id}")
    public MatchResponse getById(@PathVariable String id) {
        return matchService.getById(id);
    }

    @PutMapping("/{id}/result")
    @PreAuthorize("hasRole('ADMIN')")
    public MatchResponse recordResult(@PathVariable String id, @Valid @RequestBody MatchResultRequest request) {
        return matchService.recordResult(id, request);
    }

    @PutMapping("/{id}/schedule")
    @PreAuthorize("hasRole('ADMIN')")
    public MatchResponse scheduleMatch(@PathVariable String id, @Valid @RequestBody MatchScheduleRequest request) {
        return matchService.scheduleMatch(id, request);
    }
}
