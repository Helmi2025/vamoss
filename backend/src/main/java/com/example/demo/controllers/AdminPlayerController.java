package com.example.demo.controllers;

import com.example.demo.dto.AdminPlayerDto.*;
import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.services.AdminPlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/players")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPlayerController {

    private final AdminPlayerService adminPlayerService;

    /**
     * GET /api/admin/players
     * Returns all active players (Tennis / Padel individual players plus
     * Football / Basketball players that belong to a team).
     * Optional query params:
     *   ?sportId=... — filter by sport
     *   ?name=...    — filter by name (case-insensitive contains)
     */
    @GetMapping
    public ResponseEntity<List<PlayerSummary>> getAllPlayers(
            @RequestParam(required = false) String sportId,
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(adminPlayerService.getAllPlayers(sportId, name));
    }

    /**
     * GET /api/admin/players/{playerId}
     * Returns full player details.
     */
    @GetMapping("/{playerId}")
    public ResponseEntity<PlayerDetails> getPlayerDetails(@PathVariable String playerId) {
        return ResponseEntity.ok(adminPlayerService.getPlayerDetails(playerId));
    }

    /**
     * DELETE /api/admin/players/{playerId}
     * Permanently removes the player account.
     */
    @DeleteMapping("/{playerId}")
    public ResponseEntity<MessageResponse> deletePlayer(@PathVariable String playerId) {
        adminPlayerService.deletePlayer(playerId);
        return ResponseEntity.ok(new MessageResponse("Player deleted successfully."));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
