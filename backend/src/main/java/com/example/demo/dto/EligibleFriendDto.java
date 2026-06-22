package com.example.demo.dto;

import com.example.demo.entities.Player;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A friend that is eligible to be chosen as a doubles partner for a given tournament.
 * Filters out friends who are already registered in the tournament and friends whose
 * gender does not satisfy the tournament's gender category.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EligibleFriendDto {
    private String playerId;
    private String fullName;
    private String photoUrl;
    private Player.Gender gender;
}
