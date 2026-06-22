package com.example.demo.dto;

import com.example.demo.entities.FriendRequest;
import com.example.demo.entities.Player;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTOs for the friend / friend-request system.
 */
public class FriendDto {

    /**
     * A friend card — shown in the "My Friends" list.
     * Both parties see the same data.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendCard {
        private String playerId;
        private String username;
        private String photoUrl;
        private Player.Gender gender;
    }

    /**
     * A sent-request card — shown under "Requests Sent".
     * Allows the sender to cancel the request.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SentRequestCard {
        private String requestId;
        private String receiverId;
        private String receiverUsername;
        private String receiverPhotoUrl;
        private Player.Gender receiverGender;
        private LocalDateTime sentAt;
    }

    /**
     * A received-request card — shown under "Requests Received".
     * Allows the receiver to accept or reject.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceivedRequestCard {
        private String requestId;
        private String senderId;
        private String senderUsername;
        private String senderPhotoUrl;
        private Player.Gender senderGender;
        private LocalDateTime receivedAt;
    }

    /**
     * The full friends-page payload — returned by GET /api/player/friends/{playerId}.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendsPageDto {
        private java.util.List<FriendCard>         friends;
        private java.util.List<SentRequestCard>    sentRequests;
        private java.util.List<ReceivedRequestCard> receivedRequests;
    }

    /**
     * Status of the relationship between the logged-in player and another player.
     * Used by the explore endpoint to decorate each card.
     */
    public enum RelationStatus {
        NONE,           // no relationship
        FRIENDS,        // accepted
        REQUEST_SENT,   // current user sent a pending request
        REQUEST_RECEIVED // current user received a pending request
    }
}
