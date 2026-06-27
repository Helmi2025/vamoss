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
public class Referee extends User {

    private String refereeId;

    // The sport this referee is assigned to
    private String sportId;

    // Date when the referee was created/registered
    private LocalDateTime registeredAt;

    // Base64-encoded photo avatar (stored inline in MongoDB)
    private String photoUrl;

    public Referee(String email, String passwordHash, String fullName, String phoneNumber) {
        super(null, email, passwordHash, fullName, phoneNumber, Role.REFEREE, AccountStatus.ACTIVE);
        this.registeredAt = LocalDateTime.now();
    }
}
