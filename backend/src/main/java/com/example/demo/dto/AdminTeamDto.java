package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs used by the admin "Manage Teams" endpoints.
 */
public class AdminTeamDto {

    /** Summary card shown in the team grid (4 per row). */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamSummary {
        private String         teamId;
        private String         teamName;
        private String         sportId;
        private String         sportName;
        private String         logoUrl;
        private int            playerCount;
        private LocalDateTime  createdAt;
    }

    /** Captain info embedded in TeamDetails. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaptainInfo {
        private String captainId;
        private String fullName;
        private String photoUrl;   // base64 data-URL or null
    }

    /** Player info embedded in TeamDetails. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerInfo {
        private String playerId;
        private String fullName;
        private String photoUrl;   // currently null — placeholder for future photo support
    }

    /** Full team details shown in the slide-over / modal. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamDetails {
        private String         teamId;
        private String         teamName;
        private String         sportId;
        private String         sportName;
        private String         logoUrl;
        private CaptainInfo    captain;
        private List<PlayerInfo> players;
        private LocalDateTime  createdAt;
    }
}
