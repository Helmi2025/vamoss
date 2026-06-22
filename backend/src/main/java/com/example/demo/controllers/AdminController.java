package com.example.demo.controllers;

import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.dto.AuthDtos.UpdateProfileRequest;
import com.example.demo.dto.PendingCaptainDto;
import com.example.demo.dto.PendingPlayerDto;
import com.example.demo.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/captain-applications
     * Returns all captain applications with status PENDING_REVIEW.
     */
    @GetMapping("/captain-applications")
    public ResponseEntity<List<PendingCaptainDto>> getPendingApplications() {
        return ResponseEntity.ok(adminService.getPendingCaptains());
    }

    /**
     * PUT /api/admin/captain-applications/{userId}/approve
     * Approves the captain → sets accountStatus = ACTIVE → sends approval email.
     */
    @PutMapping("/captain-applications/{userId}/approve")
    public ResponseEntity<MessageResponse> approve(@PathVariable String userId) {
        adminService.approveCaptain(userId);
        return ResponseEntity.ok(new MessageResponse(
                "Captain approved successfully. A confirmation email has been sent."
        ));
    }

    /**
     * PUT /api/admin/captain-applications/{userId}/reject
     * Rejects the captain → sets accountStatus = INACTIVE → sends rejection email.
     * Body (optional): { "reason": "..." }
     */
    @PutMapping("/captain-applications/{userId}/reject")
    public ResponseEntity<MessageResponse> reject(
            @PathVariable String userId,
            @RequestBody(required = false) Map<String, String> body) {

        String reason = (body != null) ? body.get("reason") : null;
        adminService.rejectCaptain(userId, reason);
        return ResponseEntity.ok(new MessageResponse(
                "Captain application rejected. A notification email has been sent."
        ));
    }

    /**
     * PUT /api/admin/profile/{userId}
     * Updates the admin's own fullName, email, or password.
     * currentPassword is always required.
     */
    @PutMapping("/profile/{userId}")
    public ResponseEntity<MessageResponse> updateProfile(
            @PathVariable String userId,
            @RequestBody UpdateProfileRequest request) {
        adminService.updateProfile(userId, request);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully."));
    }

    // ════════════════════════════════════════════════════════════════════════════
    // PLAYER APPLICATION ENDPOINTS
    // ════════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/admin/player-applications
     * Returns all player applications with status PENDING_REVIEW.
     */
    @GetMapping("/player-applications")
    public ResponseEntity<List<PendingPlayerDto>> getPendingPlayerApplications() {
        return ResponseEntity.ok(adminService.getPendingPlayers());
    }

    /**
     * PUT /api/admin/player-applications/{userId}/approve
     * Approves the player → sets accountStatus = ACTIVE → sends approval email.
     */
    @PutMapping("/player-applications/{userId}/approve")
    public ResponseEntity<MessageResponse> approvePlayer(@PathVariable String userId) {
        adminService.approvePlayer(userId);
        return ResponseEntity.ok(new MessageResponse(
                "Player approved successfully. A confirmation email has been sent."
        ));
    }

    /**
     * PUT /api/admin/player-applications/{userId}/reject
     * Rejects the player → sets accountStatus = INACTIVE → sends rejection email.
     * Body (optional): { "reason": "..." }
     */
    @PutMapping("/player-applications/{userId}/reject")
    public ResponseEntity<MessageResponse> rejectPlayer(
            @PathVariable String userId,
            @RequestBody(required = false) Map<String, String> body) {

        String reason = (body != null) ? body.get("reason") : null;
        adminService.rejectPlayer(userId, reason);
        return ResponseEntity.ok(new MessageResponse(
                "Player application rejected. A notification email has been sent."
        ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
