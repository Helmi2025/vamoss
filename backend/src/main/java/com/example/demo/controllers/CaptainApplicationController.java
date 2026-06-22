package com.example.demo.controllers;

import com.example.demo.dto.CaptainApplicationRequest;
import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.services.CaptainApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/captain-application")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CaptainApplicationController {

    private final CaptainApplicationService captainApplicationService;

    /**
     * POST /api/captain-application/apply
     * Public endpoint — no authentication required.
     * Validates the form, creates the pending captain + team, sends email.
     */
    @PostMapping("/apply")
    public ResponseEntity<MessageResponse> apply(
            @Valid @RequestBody CaptainApplicationRequest request) {

        captainApplicationService.apply(request);
        return ResponseEntity.ok(new MessageResponse(
                "Your application has been submitted successfully. " +
                "Please check your email — we will contact you as soon as possible."
        ));
    }

    /**
     * Handle business-logic errors (duplicate email, duplicate team name, etc.)
     * and return a 400 with a readable message instead of a 500.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleBusinessError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
