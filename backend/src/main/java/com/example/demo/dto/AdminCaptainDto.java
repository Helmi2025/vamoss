package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTOs used by the admin "Manage Captains" endpoints.
 */
public class AdminCaptainDto {

    /** Summary card shown in the captain grid. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaptainSummary {
        private String captainId;
        private String fullName;
        private String photoUrl;    // base64 data-URL or null
        private String sportId;
        private String sportName;
        private String teamId;
        private String teamName;
        private LocalDateTime appliedAt;
    }

    /** Full captain details shown in the captain modal. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaptainDetails {
        private String captainId;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String photoUrl;    // base64 data-URL or null
        private String sportId;
        private String sportName;
        private String teamId;
        private String teamName;
        private String teamLogoUrl; // full URL for the team logo or null
        private int    playerCount;
        private LocalDateTime appliedAt;
    }
}
