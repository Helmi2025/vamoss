package com.example.demo.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String userId;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private String fullName;

    private String phoneNumber;

    private Role role; // ADMIN, CAPTAIN, PLAYER, REFEREE

    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    public enum Role {
        ADMIN, CAPTAIN, PLAYER, REFEREE
    }

    public enum AccountStatus {
        PENDING_REVIEW,
        ACTIVE,
        INACTIVE
    }
}
