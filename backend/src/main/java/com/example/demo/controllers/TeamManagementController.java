package com.example.demo.controllers;

import com.example.demo.dto.TeamManagementDtos.*;
import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.services.TeamManagementService;
import com.example.demo.services.TeamManagementService.LogoResource;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/captain/team")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('CAPTAIN')")
public class TeamManagementController {

    private final TeamManagementService teamManagementService;

    /**
     * GET /api/captain/team/{captainId}
     * Returns team info: name, sport (read-only), logo URL.
     */
    @GetMapping("/{captainId}")
    public ResponseEntity<TeamInfoDto> getTeamInfo(@PathVariable String captainId) {
        return ResponseEntity.ok(teamManagementService.getTeamInfo(captainId));
    }

    /**
     * PUT /api/captain/team/{captainId}/rename
     * Rename the team.
     */
    @PutMapping("/{captainId}/rename")
    public ResponseEntity<TeamInfoDto> renameTeam(
            @PathVariable String captainId,
            @Valid @RequestBody RenameTeamRequest request) {
        return ResponseEntity.ok(teamManagementService.renameTeam(captainId, request.getTeamName()));
    }

    /**
     * POST /api/captain/team/{captainId}/logo
     * Upload / replace the team logo (stored in GridFS).
     */
    @PostMapping(value = "/{captainId}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TeamInfoDto> uploadLogo(
            @PathVariable String captainId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(teamManagementService.uploadLogo(captainId, file));
    }

    /**
     * DELETE /api/captain/team/{captainId}/logo
     * Remove the team logo from GridFS.
     */
    @DeleteMapping("/{captainId}/logo")
    public ResponseEntity<TeamInfoDto> deleteLogo(@PathVariable String captainId) {
        return ResponseEntity.ok(teamManagementService.deleteLogo(captainId));
    }

    /**
     * GET /api/captain/team/logo/{fileId}
     * Stream the team logo image bytes (used as <img src="...">).
     * Overrides the class-level @PreAuthorize so browser <img> tags (which cannot
     * send a JWT) can load the logo without authentication.
     */
    @GetMapping("/logo/{fileId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<byte[]> getLogo(@PathVariable String fileId) throws IOException {
        LogoResource resource = teamManagementService.getLogo(fileId);
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(resource.getContentType());
        } catch (Exception e) {
            mediaType = MediaType.IMAGE_PNG;
        }
        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(resource.getData());
    }

    /**
     * GET /api/captain/team/{captainId}/players
     * List all players in the captain's team.
     */
    @GetMapping("/{captainId}/players")
    public ResponseEntity<List<PlayerDto>> getPlayers(@PathVariable String captainId) {
        return ResponseEntity.ok(teamManagementService.getPlayers(captainId));
    }

    /**
     * POST /api/captain/team/{captainId}/players
     * Add a new player: creates the Player user (ACTIVE) and sends a welcome email.
     */
    @PostMapping("/{captainId}/players")
    public ResponseEntity<PlayerDto> addPlayer(
            @PathVariable String captainId,
            @Valid @RequestBody AddPlayerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamManagementService.addPlayer(captainId, request));
    }

    /**
     * PUT /api/captain/team/{captainId}/players/{playerId}
     * Update a player's fullName and/or email (captain-side, no password required).
     */
    @PutMapping("/{captainId}/players/{playerId}")
    public ResponseEntity<PlayerDto> updatePlayer(
            @PathVariable String captainId,
            @PathVariable String playerId,
            @RequestBody UpdatePlayerRequest request) {
        return ResponseEntity.ok(teamManagementService.updatePlayer(captainId, playerId, request));
    }

    /**
     * POST /api/captain/team/{captainId}/players/{playerId}/photo
     * Upload / replace a player's avatar photo (captain-side).
     */
    @PostMapping(value = "/{captainId}/players/{playerId}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<com.example.demo.dto.AuthDtos.PhotoResponse> uploadPlayerPhoto(
            @PathVariable String captainId,
            @PathVariable String playerId,
            @RequestParam("file") MultipartFile file) {
        try {
            String dataUrl = teamManagementService.uploadPlayerPhoto(captainId, playerId, file);
            return ResponseEntity.ok(new com.example.demo.dto.AuthDtos.PhotoResponse("Photo updated successfully.", dataUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new com.example.demo.dto.AuthDtos.PhotoResponse(e.getMessage(), null));
        }
    }

    /**
     * DELETE /api/captain/team/{captainId}/players/{playerId}/photo
     * Remove a player's avatar photo (captain-side).
     */
    @DeleteMapping("/{captainId}/players/{playerId}/photo")
    public ResponseEntity<MessageResponse> deletePlayerPhoto(
            @PathVariable String captainId,
            @PathVariable String playerId) {
        teamManagementService.deletePlayerPhoto(captainId, playerId);
        return ResponseEntity.ok(new MessageResponse("Photo removed successfully."));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
