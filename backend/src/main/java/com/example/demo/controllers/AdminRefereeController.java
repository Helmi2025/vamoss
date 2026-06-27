package com.example.demo.controllers;

import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.services.AdminRefereeService;
import com.example.demo.services.AdminRefereeService.RefereeSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/referees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRefereeController {

    private final AdminRefereeService adminRefereeService;

    /**
     * GET /api/admin/referees
     * Returns all active referees.
     * Optional query param:
     *   ?sportId=... — filter by sport
     */
    @GetMapping
    public ResponseEntity<List<RefereeSummary>> getAllReferees(
            @RequestParam(required = false) String sportId) {
        return ResponseEntity.ok(adminRefereeService.getAllReferees(sportId));
    }

    /**
     * POST /api/admin/referees
     * Creates a new referee and sends credentials via email.
     */
    @PostMapping
    public ResponseEntity<RefereeSummary> createReferee(@RequestBody Map<String, String> request) {
        String fullName = request.get("fullName");
        String email = request.get("email");
        String phoneNumber = request.get("phoneNumber");
        String sportId = request.get("sportId");

        if (fullName == null || email == null || sportId == null) {
            return ResponseEntity.badRequest().build();
        }

        RefereeSummary created = adminRefereeService.createReferee(fullName, email, phoneNumber, sportId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/admin/referees/{refereeId}
     * Updates referee information.
     */
    @PutMapping("/{refereeId}")
    public ResponseEntity<RefereeSummary> updateReferee(
            @PathVariable String refereeId,
            @RequestBody Map<String, String> request) {
        String fullName = request.get("fullName");
        String phoneNumber = request.get("phoneNumber");
        String sportId = request.get("sportId");

        RefereeSummary updated = adminRefereeService.updateReferee(refereeId, fullName, phoneNumber, sportId);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/admin/referees/{refereeId}
     * Deletes a referee.
     */
    @DeleteMapping("/{refereeId}")
    public ResponseEntity<MessageResponse> deleteReferee(@PathVariable String refereeId) {
        adminRefereeService.deleteReferee(refereeId);
        return ResponseEntity.ok(new MessageResponse("Referee deleted successfully"));
    }

    /**
     * GET /api/admin/referees/by-sport/{sportId}
     * Returns referees for a specific sport (used for match assignment).
     */
    @GetMapping("/by-sport/{sportId}")
    public ResponseEntity<List<RefereeSummary>> getRefereesBySport(@PathVariable String sportId) {
        return ResponseEntity.ok(adminRefereeService.getAllReferees(sportId));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
