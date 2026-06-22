package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class TeamManagementDtos {

    /** Returned when the captain loads the Manage Team page. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamInfoDto {
        private String teamId;
        private String teamName;
        private String sportName;
        private String sportId;
        private String logoUrl;       // full URL to stream the logo, or null
    }

    /** Request body for updating a player's fullName and/or email (captain-side). */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdatePlayerRequest {
        private String newFullName;
        private String newEmail;
    }

    /** Request body for renaming the team. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RenameTeamRequest {
        @NotBlank(message = "Team name is required")
        private String teamName;
    }

    /** Compact player info returned in the player list. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerDto {
        private String playerId;
        private String fullName;
        private String email;
        private String photoUrl;  // base64 data-url or null
    }

    /** Request body for adding a new player to the team. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddPlayerRequest {

        @NotBlank(message = "Username is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
            message = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        )
        private String password;
    }

    // ── Player dashboard DTOs ─────────────────────────────────────────────────

    /** Compact player info shown on the team view (includes photo for display). */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerCardDto {
        private String playerId;
        private String fullName;
        private String photoUrl;   // base64 data-url or null
        private boolean isSelf;    // true when this card is the viewing player
    }

    /** Full team view returned to a player when they open their dashboard. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerTeamViewDto {
        private String teamId;
        private String teamName;
        private String sportName;
        private String sportId;
        private String logoUrl;          // GridFS-backed URL or null
        private String createdAt;        // ISO date string
        // Captain card
        private String captainId;
        private String captainName;
        private String captainPhotoUrl;  // base64 data-url or null
        // All players
        private java.util.List<PlayerCardDto> players;
    }
}
