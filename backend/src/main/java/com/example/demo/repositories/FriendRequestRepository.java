package com.example.demo.repositories;

import com.example.demo.entities.FriendRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends MongoRepository<FriendRequest, String> {

    /** All requests sent BY a player (any status). */
    List<FriendRequest> findBySenderId(String senderId);

    /** All requests received BY a player (any status). */
    List<FriendRequest> findByReceiverId(String receiverId);

    /** Accepted requests sent by this player. */
    List<FriendRequest> findBySenderIdAndStatus(String senderId, FriendRequest.Status status);

    /** Accepted requests received by this player. */
    List<FriendRequest> findByReceiverIdAndStatus(String receiverId, FriendRequest.Status status);

    /** Find the request document between two players regardless of direction. */
    Optional<FriendRequest> findBySenderIdAndReceiverId(String senderId, String receiverId);

    /** Check whether any request exists between two players in either direction. */
    boolean existsBySenderIdAndReceiverId(String senderId, String receiverId);
}
