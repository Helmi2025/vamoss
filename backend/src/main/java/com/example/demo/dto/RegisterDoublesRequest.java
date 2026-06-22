package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for POST /api/tournaments/{id}/register-doubles.
 * The registering player supplies their own ID and the ID of the friend they
 * wish to pair with.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDoublesRequest {

    @NotBlank(message = "Player ID is required")
    private String playerId;

    @NotBlank(message = "Partner ID is required")
    private String partnerId;
}
