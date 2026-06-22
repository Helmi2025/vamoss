package com.example.demo.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Represents a friend request between two individual-sport players
 * (Tennis or Padel). Once accepted, the status becomes ACCEPTED and
 * both players effectively consider each other friends.
 */
@Data
@NoArgsConstructor
@Document(collection = "friend_requests")
public class FriendRequest {

    @Id
    private String id;

    /** The player who sent the request (MongoDB _id / userId). */
    private String senderId;

    /** The player who received the request (MongoDB _id / userId). */
    private String receiverId;

    private Status status;

    private LocalDateTime createdAt;

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED
    }

    public FriendRequest(String senderId, String receiverId) {
        this.senderId   = senderId;
        this.receiverId = receiverId;
        this.status     = Status.PENDING;
        this.createdAt  = LocalDateTime.now();
    }
}
