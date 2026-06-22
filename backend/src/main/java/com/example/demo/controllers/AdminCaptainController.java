package com.example.demo.controllers;

import com.example.demo.dto.AdminCaptainDto.*;
import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.services.AdminCaptainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/captains")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCaptainController {

    private final AdminCaptainService adminCaptainService;

    /**
     * GET /api/admin/captains
     * Returns all active captains.
     * Optional query params:
     *   ?sportId=... — filter by sport
     *   ?name=...    — filter by name (case-insensitive contains)
     */
    @GetMapping
    public ResponseEntity<List<CaptainSummary>> getAllCaptains(
            @RequestParam(required = false) String sportId,
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(adminCaptainService.getAllCaptains(sportId, name));
    }

    /**
     * GET /api/admin/captains/{captainId}
     * Returns full captain details including team info.
     */
    @GetMapping("/{captainId}")
    public ResponseEntity<CaptainDetails> getCaptainDetails(@PathVariable String captainId) {
        return ResponseEntity.ok(adminCaptainService.getCaptainDetails(captainId));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
