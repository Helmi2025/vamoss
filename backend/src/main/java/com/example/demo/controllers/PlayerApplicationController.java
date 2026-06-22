package com.example.demo.controllers;

import com.example.demo.dto.PlayerApplicationRequest;
import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.services.PlayerApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/player-application")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlayerApplicationController {

    private final PlayerApplicationService playerApplicationService;

    /**
     * POST /api/player-application/apply
     * Public endpoint — no authentication required.
     * Validates the form, creates the pending player, sends email.
     */
    @PostMapping("/apply")
    public ResponseEntity<MessageResponse> apply(
            @Valid @RequestBody PlayerApplicationRequest request) {

        playerApplicationService.apply(request);
        return ResponseEntity.ok(new MessageResponse(
                "Your application has been submitted successfully. " +
                "Please check your email — we will contact you as soon as possible."
        ));
    }

    /**
     * Handle business-logic errors (duplicate email, team sport selected, etc.)
     * and return a 400 with a readable message instead of a 500.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleBusinessError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
