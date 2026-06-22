package com.example.demo.services;

import com.example.demo.dto.FriendDto;
import com.example.demo.dto.FriendDto.*;
import com.example.demo.entities.FriendRequest;
import com.example.demo.entities.Player;
import com.example.demo.entities.User;
import com.example.demo.repositories.FriendRequestRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository          userRepository;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Player loadPlayer(String userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Player not found: " + userId));
        if (!(u instanceof Player)) throw new RuntimeException("User is not a player: " + userId);
        return (Player) u;
    }

    private FriendCard toFriendCard(Player p) {
        return new FriendCard(p.getPlayerId(), p.getFullName(), p.getPhotoUrl(), p.getGender());
    }

    // ── SEND friend request ───────────────────────────────────────────────────

    public String sendRequest(String senderId, String receiverId) {
        if (senderId.equals(receiverId))
            throw new RuntimeException("You cannot send a friend request to yourself.");

        Player sender   = loadPlayer(senderId);
        Player receiver = loadPlayer(receiverId);

        // Must share the same sport
        if (sender.getSportId() == null || !sender.getSportId().equals(receiver.getSportId()))
            throw new RuntimeException("You can only send friend requests to players in the same sport.");

        // Check no existing relationship in either direction
        checkNoExistingRelation(senderId, receiverId);

        FriendRequest req = new FriendRequest(senderId, receiverId);
        friendRequestRepository.save(req);
        return req.getId();
    }

    private void checkNoExistingRelation(String a, String b) {
        // Check A→B
        Optional<FriendRequest> ab = friendRequestRepository.findBySenderIdAndReceiverId(a, b);
        if (ab.isPresent()) {
            FriendRequest.Status s = ab.get().getStatus();
            if (s == FriendRequest.Status.PENDING)  throw new RuntimeException("Friend request already sent.");
            if (s == FriendRequest.Status.ACCEPTED)  throw new RuntimeException("You are already friends.");
        }
        // Check B→A
        Optional<FriendRequest> ba = friendRequestRepository.findBySenderIdAndReceiverId(b, a);
        if (ba.isPresent()) {
            FriendRequest.Status s = ba.get().getStatus();
            if (s == FriendRequest.Status.PENDING)  throw new RuntimeException("This player already sent you a request.");
            if (s == FriendRequest.Status.ACCEPTED)  throw new RuntimeException("You are already friends.");
        }
    }

    // ── CANCEL sent request ───────────────────────────────────────────────────

    public void cancelRequest(String requestId, String requesterId) {
        FriendRequest req = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found."));
        if (!req.getSenderId().equals(requesterId))
            throw new RuntimeException("You are not the sender of this request.");
        if (req.getStatus() != FriendRequest.Status.PENDING)
            throw new RuntimeException("Request is no longer pending.");
        friendRequestRepository.deleteById(requestId);
    }

    // ── ACCEPT request ────────────────────────────────────────────────────────

    public void acceptRequest(String requestId, String receiverId) {
        FriendRequest req = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found."));
        if (!req.getReceiverId().equals(receiverId))
            throw new RuntimeException("You are not the receiver of this request.");
        if (req.getStatus() != FriendRequest.Status.PENDING)
            throw new RuntimeException("Request is no longer pending.");
        req.setStatus(FriendRequest.Status.ACCEPTED);
        friendRequestRepository.save(req);
    }

    // ── REJECT request ────────────────────────────────────────────────────────

    public void rejectRequest(String requestId, String receiverId) {
        FriendRequest req = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found."));
        if (!req.getReceiverId().equals(receiverId))
            throw new RuntimeException("You are not the receiver of this request.");
        if (req.getStatus() != FriendRequest.Status.PENDING)
            throw new RuntimeException("Request is no longer pending.");
        friendRequestRepository.deleteById(requestId);
    }

    // ── GET friends page ──────────────────────────────────────────────────────

    public FriendsPageDto getFriendsPage(String playerId) {

        // ── Friends: all ACCEPTED requests where playerId is either party ────
        List<FriendCard> friends = friendRequestRepository
                .findBySenderIdAndStatus(playerId, FriendRequest.Status.ACCEPTED)
                .stream()
                .map(r -> toFriendCard(loadPlayer(r.getReceiverId())))
                .collect(Collectors.toList());

        friendRequestRepository
                .findByReceiverIdAndStatus(playerId, FriendRequest.Status.ACCEPTED)
                .stream()
                .map(r -> toFriendCard(loadPlayer(r.getSenderId())))
                .forEach(friends::add);

        // ── Sent: PENDING requests sent by this player ────────────────────────
        List<SentRequestCard> sent = friendRequestRepository
                .findBySenderId(playerId)
                .stream()
                .filter(r -> r.getStatus() == FriendRequest.Status.PENDING)
                .map(r -> {
                    Player receiver = loadPlayer(r.getReceiverId());
                    return new SentRequestCard(
                            r.getId(),
                            receiver.getPlayerId(),
                            receiver.getFullName(),
                            receiver.getPhotoUrl(),
                            receiver.getGender(),
                            r.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());

        // ── Received: PENDING requests received by this player ────────────────
        List<ReceivedRequestCard> received = friendRequestRepository
                .findByReceiverId(playerId)
                .stream()
                .filter(r -> r.getStatus() == FriendRequest.Status.PENDING)
                .map(r -> {
                    Player sender = loadPlayer(r.getSenderId());
                    return new ReceivedRequestCard(
                            r.getId(),
                            sender.getPlayerId(),
                            sender.getFullName(),
                            sender.getPhotoUrl(),
                            sender.getGender(),
                            r.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());

        return new FriendsPageDto(friends, sent, received);
    }

    // ── Relationship status between two players (for explore cards) ───────────

    public RelationStatus getRelationStatus(String viewerId, String targetId) {
        // Viewer → Target
        Optional<FriendRequest> vt = friendRequestRepository
                .findBySenderIdAndReceiverId(viewerId, targetId);
        if (vt.isPresent()) {
            return vt.get().getStatus() == FriendRequest.Status.ACCEPTED
                    ? RelationStatus.FRIENDS
                    : RelationStatus.REQUEST_SENT;
        }
        // Target → Viewer
        Optional<FriendRequest> tv = friendRequestRepository
                .findBySenderIdAndReceiverId(targetId, viewerId);
        if (tv.isPresent()) {
            return tv.get().getStatus() == FriendRequest.Status.ACCEPTED
                    ? RelationStatus.FRIENDS
                    : RelationStatus.REQUEST_RECEIVED;
        }
        return RelationStatus.NONE;
    }

    /**
     * Returns the pending request id if the viewer sent a pending request to the target,
     * null otherwise.
     */
    public String getPendingRequestId(String viewerId, String targetId) {
        return friendRequestRepository.findBySenderIdAndReceiverId(viewerId, targetId)
                .filter(r -> r.getStatus() == FriendRequest.Status.PENDING)
                .map(FriendRequest::getId)
                .orElse(null);
    }
}
