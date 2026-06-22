package com.example.demo.entities;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@Document(collection = "users")
public class Player extends User {

    private String playerId;

    // For team-sport players — set when captain adds them to a team
    private String teamId;
    private String captainId;

    // For individual-sport players (Tennis, Padel) — set at application time
    private String sportId;
    private LocalDateTime appliedAt;

    // Base64-encoded profile photo (stored inline, same approach as Captain)
    private String photoUrl;

    // Gender — required for individual-sport applications
    private Gender gender;

    public enum Gender {
        MALE, FEMALE
    }

    /** Used by captain's "add player to team" flow (status = ACTIVE immediately). */
    public Player(String email, String passwordHash, String fullName, String phoneNumber) {
        super(null, email, passwordHash, fullName, phoneNumber, Role.PLAYER, AccountStatus.ACTIVE);
    }

    /** Used by the public player-application flow (status = PENDING_REVIEW). */
    public Player(String email, String passwordHash, String fullName,
                  String phoneNumber, AccountStatus status) {
        super(null, email, passwordHash, fullName, phoneNumber, Role.PLAYER, status);
    }
}
