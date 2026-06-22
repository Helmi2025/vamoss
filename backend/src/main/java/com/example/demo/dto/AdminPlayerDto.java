package com.example.demo.dto;

import com.example.demo.entities.Player;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTOs used by the admin "Manage Players" endpoints.
 */
public class AdminPlayerDto {

    /** Summary card shown in the player grid. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerSummary {
        private String playerId;
        private String fullName;
        private String photoUrl;      // base64 data-URL or null
        private String sportId;
        private String sportName;
        private LocalDateTime appliedAt;
        private Player.Gender gender;
    }

    /** Full player details shown in the player modal. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerDetails {
        private String playerId;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String photoUrl;      // base64 data-URL or null
        private String sportId;
        private String sportName;
        private LocalDateTime appliedAt;
        private Player.Gender gender;
    }
}
