package com.example.demo.dto;

import com.example.demo.entities.Player;
import com.example.demo.entities.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PendingPlayerDto {
    private String userId;
    private String fullName;
    private String email;
    private String sportName;
    private String sportId;
    private LocalDateTime appliedAt;
    private User.AccountStatus accountStatus;
    private Player.Gender gender;
}
