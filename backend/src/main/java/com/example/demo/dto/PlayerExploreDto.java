package com.example.demo.dto;

import com.example.demo.entities.Player;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight player card shown in the "Explore Players" section.
 * Exposed to other players — no private fields (email, phone, etc.).
 * {@code relationStatus} tells the viewer how they relate to this player
 * so the UI can render the correct action button.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerExploreDto {
    private String playerId;
    private String username;
    private String photoUrl;
    private Player.Gender gender;
    /** Relationship from the requesting player's point of view. */
    private FriendDto.RelationStatus relationStatus;
    /** requestId — set when status is REQUEST_SENT so the sender can cancel it. */
    private String pendingRequestId;
}
