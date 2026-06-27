package com.example.demo.controllers;

import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.dto.AuthDtos.PhotoResponse;
import com.example.demo.dto.AuthDtos.RefereeProfileUpdateRequest;
import com.example.demo.entities.Tournament;
import com.example.demo.entities.TournamentMatch;
import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.RefereeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/referee")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('REFEREE')")
public class RefereeController {

    private final RefereeService refereeService;
    private final UserRepository userRepository;

    /**
     * GET /api/referee/matches
     * Returns all matches assigned to the logged-in referee.
     */
    @GetMapping("/matches")
    public ResponseEntity<List<TournamentMatch>> getMyMatches(Authentication authentication) {
        String refereeId = getCurrentRefereeId(authentication);
        return ResponseEntity.ok(refereeService.getRefereeMatches(refereeId));
    }

    /**
     * GET /api/referee/tournaments
     * Returns all tournaments where the referee has assigned matches.
     */
    @GetMapping("/tournaments")
    public ResponseEntity<List<Tournament>> getMyTournaments(Authentication authentication) {
        String refereeId = getCurrentRefereeId(authentication);
        return ResponseEntity.ok(refereeService.getRefereeTournaments(refereeId));
    }

    /**
     * PUT /api/referee/matches/{id}/result
     * Update match score and statistics.
     */
    @PutMapping("/matches/{id}/result")
    public ResponseEntity<TournamentMatch> updateMatchResult(
            @PathVariable String id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        String refereeId = getCurrentRefereeId(authentication);

        Integer score1 = request.get("score1") != null ? (Integer) request.get("score1") : null;
        Integer score2 = request.get("score2") != null ? (Integer) request.get("score2") : null;
        Integer yellowCardsTeam1 = request.get("yellowCardsTeam1") != null ? (Integer) request.get("yellowCardsTeam1") : null;
        Integer yellowCardsTeam2 = request.get("yellowCardsTeam2") != null ? (Integer) request.get("yellowCardsTeam2") : null;
        Integer redCardsTeam1 = request.get("redCardsTeam1") != null ? (Integer) request.get("redCardsTeam1") : null;
        Integer redCardsTeam2 = request.get("redCardsTeam2") != null ? (Integer) request.get("redCardsTeam2") : null;

        TournamentMatch updated = refereeService.updateMatchResult(
                refereeId, id, score1, score2,
                yellowCardsTeam1, yellowCardsTeam2,
                redCardsTeam1, redCardsTeam2
        );
        return ResponseEntity.ok(updated);
    }

    /**
     * PUT /api/referee/matches/{id}/schedule
     * Reschedule match date and field.
     */
    @PutMapping("/matches/{id}/schedule")
    public ResponseEntity<TournamentMatch> rescheduleMatch(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String refereeId = getCurrentRefereeId(authentication);

        LocalDateTime newScheduledDate = request.get("scheduledDate") != null
                ? LocalDateTime.parse(request.get("scheduledDate"))
                : null;
        String newFieldId = request.get("fieldId");

        TournamentMatch updated = refereeService.rescheduleMatch(refereeId, id, newScheduledDate, newFieldId);
        return ResponseEntity.ok(updated);
    }

    /**
     * PUT /api/referee/profile/{userId}
     * Updates referee's fullName, email, or password.
     * currentPassword is always required.
     */
    @PutMapping("/profile/{userId}")
    public ResponseEntity<MessageResponse> updateProfile(
            @PathVariable String userId,
            @RequestBody RefereeProfileUpdateRequest request) {
        refereeService.updateProfile(userId, request);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully."));
    }

    /**
     * POST /api/referee/profile/{userId}/photo
     * Uploads / replaces the referee's avatar photo.
     * Does NOT require currentPassword.
     */
    @PostMapping(value = "/profile/{userId}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoResponse> uploadPhoto(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file) {
        try {
            String dataUrl = refereeService.uploadPhoto(userId, file);
            return ResponseEntity.ok(new PhotoResponse("Photo updated successfully.", dataUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new PhotoResponse(e.getMessage(), null));
        }
    }

    /**
     * DELETE /api/referee/profile/{userId}/photo
     * Removes the referee's avatar photo.
     * Does NOT require currentPassword.
     */
    @DeleteMapping("/profile/{userId}/photo")
    public ResponseEntity<MessageResponse> deletePhoto(@PathVariable String userId) {
        refereeService.deletePhoto(userId);
        return ResponseEntity.ok(new MessageResponse("Photo removed successfully."));
    }

    /**
     * GET /api/referee/profile/{userId}/photo
     * Returns the current photoUrl (data-url string or null).
     */
    @GetMapping("/profile/{userId}/photo")
    public ResponseEntity<Map<String, String>> getPhoto(@PathVariable String userId) {
        String url = refereeService.getPhotoUrl(userId);
        return ResponseEntity.ok(Map.of("photoUrl", url != null ? url : ""));
    }

    // ── Helper methods ───────────────────────────────────────────────────────

    private String getCurrentRefereeId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        if (user.getRole() != User.Role.REFEREE) {
            throw new RuntimeException("User is not a referee");
        }

        return user.getUserId();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
