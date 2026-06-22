package com.example.demo.controllers;

import com.example.demo.dto.StatsDtos;
import com.example.demo.services.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/team/{teamId}")
    public ResponseEntity<StatsDtos.ParticipantStatsDto> getTeamStats(@PathVariable String teamId) {
        return ResponseEntity.ok(statsService.getTeamStats(teamId));
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<StatsDtos.ParticipantStatsDto> getPlayerStats(@PathVariable String playerId) {
        return ResponseEntity.ok(statsService.getPlayerStats(playerId));
    }

    @GetMapping("/rankings")
    public ResponseEntity<List<StatsDtos.TeamRankingDto>> getRankings() {
        return ResponseEntity.ok(statsService.getRankings());
    }

    @GetMapping("/team/{teamId}/profile")
    public ResponseEntity<StatsDtos.TeamProfileDto> getTeamProfile(@PathVariable String teamId) {
        return ResponseEntity.ok(statsService.getTeamProfile(teamId));
    }
}
