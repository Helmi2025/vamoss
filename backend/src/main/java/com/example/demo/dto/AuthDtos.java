package com.example.demo.dto;

import com.example.demo.entities.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// ─── Request DTOs ─────────────────────────────────────────────────────────────

public class AuthDtos {

    // Login request (shared by all roles)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    // Register request (admin creates users, or self-registration)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        private String email;
        private String password;
        private String fullName;
        private String phoneNumber;
        private User.Role role; // ADMIN | CAPTAIN | PLAYER
    }

    // JWT response returned after successful login / register
    @Data
    @NoArgsConstructor
    public static class AuthResponse {
        private String token;
        private String userId;
        private String email;
        private String fullName;
        private User.Role role;
        // Player-specific — null for non-player roles
        private String teamId;    // set when player belongs to a team
        private String sportId;   // set when player applied via individual-sport flow

        // Constructor used for non-player roles (Admin, Captain)
        public AuthResponse(String token, String userId, String email, String fullName, User.Role role) {
            this.token    = token;
            this.userId   = userId;
            this.email    = email;
            this.fullName = fullName;
            this.role     = role;
        }

        // Constructor used for Player role
        public AuthResponse(String token, String userId, String email, String fullName,
                            User.Role role, String teamId, String sportId) {
            this(token, userId, email, fullName, role);
            this.teamId  = teamId;
            this.sportId = sportId;
        }
    }

    // Generic message wrapper
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }

    // Profile update request — all fields optional except currentPassword
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String currentPassword; // required for any change
        private String newFullName;     // null = no change
        private String newEmail;        // null = no change
        private String newPassword;     // null = no change
    }

    // Captain profile update — same as admin but currentPassword is still required
    // for name/email/password changes; photo changes do NOT require currentPassword
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaptainProfileUpdateRequest {
        private String currentPassword; // required for name/email/password changes
        private String newFullName;
        private String newEmail;
        private String newPassword;
    }

    // Captain photo response
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhotoResponse {
        private String message;
        private String photoUrl; // base64 data-url or null when deleted
    }

    // Player profile update — same fields as captain
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerProfileUpdateRequest {
        private String currentPassword; // required for name/email/password changes
        private String newFullName;
        private String newEmail;
        private String newPassword;
    }
}
