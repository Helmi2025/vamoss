package com.example.demo.entities;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@Document(collection = "users")
public class Admin extends User {

    @Setter
    private String adminId;

    public Admin(String email, String passwordHash, String fullName, String phoneNumber) {
        super(null, email, passwordHash, fullName, phoneNumber, Role.ADMIN, AccountStatus.ACTIVE);
        this.adminId = null; // will be set after save
    }
}
