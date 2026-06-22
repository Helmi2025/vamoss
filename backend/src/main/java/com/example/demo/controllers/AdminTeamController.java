package com.example.demo.controllers;

import com.example.demo.dto.AdminTeamDto.*;
import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.services.AdminTeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/teams")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTeamController {

    private final AdminTeamService adminTeamService;

    /**
     * GET /api/admin/teams
     * Returns all teams (summary cards).
     * Optional query param: ?sportId=... to filter by sport.
     */
    @GetMapping
    public ResponseEntity<List<TeamSummary>> getAllTeams(
            @RequestParam(required = false) String sportId) {
        return ResponseEntity.ok(adminTeamService.getAllTeams(sportId));
    }

    /**
     * GET /api/admin/teams/{teamId}
     * Returns full team details: logo, name, captain, players, createdAt.
     */
    @GetMapping("/{teamId}")
    public ResponseEntity<TeamDetails> getTeamDetails(@PathVariable String teamId) {
        return ResponseEntity.ok(adminTeamService.getTeamDetails(teamId));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
