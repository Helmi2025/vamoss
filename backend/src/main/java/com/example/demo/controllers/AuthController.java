package com.example.demo.controllers;

import com.example.demo.dto.AuthDtos.*;
import com.example.demo.services.AuthService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

	@Autowired
    private  AuthService authService;

    /**
     * POST /api/auth/register
     * Open to all — or restrict to ADMIN only if needed via @PreAuthorize
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * Open to all roles
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // ── Protected test endpoints ─────────────────────────────────────────────

    @GetMapping("/admin/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> adminProfile() {
        return ResponseEntity.ok(new MessageResponse("Welcome, Admin!"));
    }

    @GetMapping("/captain/profile")
    @PreAuthorize("hasRole('CAPTAIN')")
    public ResponseEntity<MessageResponse> captainProfile() {
        return ResponseEntity.ok(new MessageResponse("Welcome, Captain!"));
    }

    @GetMapping("/player/profile")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<MessageResponse> playerProfile() {
        return ResponseEntity.ok(new MessageResponse("Welcome, Player!"));
    }

    // ── Exception handling ───────────────────────────────────────────────────

    /**
     * Catches business-logic errors (wrong password, account status blocks, etc.)
     * and returns a 401 with a readable message instead of a 500.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleAuthError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse(ex.getMessage()));
    }
}
