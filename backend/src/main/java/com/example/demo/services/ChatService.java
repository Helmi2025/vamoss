package com.example.demo.services;

import com.example.demo.dto.ChatDtos.*;
import com.example.demo.entities.*;
import com.example.demo.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatThreadRepository   chatThreadRepository;
    private final ChatMessageRepository  chatMessageRepository;
    private final UserRepository         userRepository;
    private final CaptainRepository      captainRepository;
    private final PlayerRepository       playerRepository;
    private final RefereeRepository      refereeRepository;
    private final TeamRepository         teamRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final SimpMessagingTemplate  messagingTemplate;

    // ── Thread creation ───────────────────────────────────────────────────────

    public ThreadIdResponse createTeamThread(String teamId, String requesterId) {
        System.out.println("[ChatService] createTeamThread - teamId: " + teamId + ", requesterId: " + requesterId);
        
        if (teamId == null || teamId.isBlank()) {
            throw new RuntimeException("Team ID cannot be null.");
        }
        
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));

        System.out.println("[ChatService] Loading user with ID: " + requesterId);
        User requester = loadUser(requesterId);
        System.out.println("[ChatService] User loaded successfully: " + requester.getUserId() + " (" + requester.getRole() + ")");
        
        boolean isAdmin = requester.getRole() == User.Role.ADMIN;
        
        // For captain check, use role-specific ID
        boolean isCaptain = false;
        if (requester.getRole() == User.Role.CAPTAIN && requester instanceof Captain captain) {
            String captainId = captain.getCaptainId();
            System.out.println("[ChatService] Captain check - captainId: " + captainId + ", team.captainId: " + team.getCaptainId());
            isCaptain = team.getCaptainId().equals(captainId);
        }
        
        if (!isAdmin && !isCaptain) {
            throw new RuntimeException("Only the team captain or an admin can create a team chat.");
        }

        Optional<ChatThread> existing = chatThreadRepository.findByTeamIdAndType(teamId, ChatThread.Type.GROUP);
        if (existing.isPresent()) {
            syncTeamParticipants(existing.get(), team);
            return new ThreadIdResponse(existing.get().getId());
        }

        List<String> participants = buildTeamParticipants(team);
        System.out.println("[ChatService] Creating thread with participants: " + participants);
        ChatThread thread = new ChatThread(
                null,
                ChatThread.Type.GROUP,
                participants,
                teamId,
                LocalDateTime.now()
        );
        ChatThread saved = chatThreadRepository.save(thread);
        System.out.println("[ChatService] Thread created with ID: " + saved.getId());
        return new ThreadIdResponse(saved.getId());
    }

    public ThreadIdResponse createPrivateThread(String userId, String otherUserId) {
        if (userId.equals(otherUserId)) {
            throw new RuntimeException("Cannot create a private chat with yourself.");
        }

        loadUser(userId);
        loadUser(otherUserId);

        if (!areFriends(userId, otherUserId)) {
            throw new RuntimeException("You can only chat with friends.");
        }

        Optional<ChatThread> existing = chatThreadRepository.findPrivateThreadBetween(userId, otherUserId);
        if (existing.isPresent()) {
            return new ThreadIdResponse(existing.get().getId());
        }

        ChatThread thread = new ChatThread(
                null,
                ChatThread.Type.PRIVATE,
                List.of(userId, otherUserId),
                null,
                LocalDateTime.now()
        );
        ChatThread saved = chatThreadRepository.save(thread);
        return new ThreadIdResponse(saved.getId());
    }

    /** Called when a friend request is accepted — ensures a private thread exists. */
    public void ensurePrivateThread(String userId1, String userId2) {
        if (chatThreadRepository.findPrivateThreadBetween(userId1, userId2).isPresent()) {
            return;
        }
        ChatThread thread = new ChatThread(
                null,
                ChatThread.Type.PRIVATE,
                List.of(userId1, userId2),
                null,
                LocalDateTime.now()
        );
        chatThreadRepository.save(thread);
    }

    // ── Team participant sync ─────────────────────────────────────────────────

    public void addParticipantToTeamThread(String teamId, String playerId) {
        chatThreadRepository.findByTeamIdAndType(teamId, ChatThread.Type.GROUP)
                .ifPresent(thread -> {
                    if (!thread.getParticipants().contains(playerId)) {
                        thread.getParticipants().add(playerId);
                        chatThreadRepository.save(thread);
                    }
                });
    }

    public void removeParticipantFromTeamThread(String teamId, String playerId) {
        chatThreadRepository.findByTeamIdAndType(teamId, ChatThread.Type.GROUP)
                .ifPresent(thread -> {
                    thread.getParticipants().remove(playerId);
                    chatThreadRepository.save(thread);
                });
    }

    public void ensureTeamThread(String teamId) {
        teamRepository.findById(teamId).ifPresent(team -> {
            Optional<ChatThread> existing = chatThreadRepository.findByTeamIdAndType(teamId, ChatThread.Type.GROUP);
            if (existing.isPresent()) {
                syncTeamParticipants(existing.get(), team);
            } else {
                List<String> participants = buildTeamParticipants(team);
                ChatThread thread = new ChatThread(
                        null,
                        ChatThread.Type.GROUP,
                        participants,
                        teamId,
                        LocalDateTime.now()
                );
                chatThreadRepository.save(thread);
            }
        });
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    public List<ThreadSummaryDto> getThreadsForUser(String userId) {
        return chatThreadRepository.findByParticipantsContaining(userId).stream()
                .map(thread -> toThreadSummary(thread, userId))
                .sorted(Comparator.comparing(
                        ThreadSummaryDto::getLastMessageAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public List<ChatMessageDto> getMessages(String threadId, String userId) {
        ChatThread thread = loadThread(threadId);
        assertParticipant(thread, userId);
        return chatMessageRepository.findByThreadIdOrderByTimestampAsc(threadId).stream()
                .map(this::toMessageDto)
                .collect(Collectors.toList());
    }

    // ── Send message ──────────────────────────────────────────────────────────

    public ChatMessageDto sendMessage(String threadId, String senderId, String content) {
        System.out.println("[ChatService] sendMessage - threadId: " + threadId + ", senderId: " + senderId + ", content: " + content);
        
        if (content == null || content.isBlank()) {
            throw new RuntimeException("Message content cannot be empty.");
        }

        ChatThread thread = loadThread(threadId);
        System.out.println("[ChatService] sendMessage - thread loaded, participants: " + thread.getParticipants());
        
        assertParticipant(thread, senderId);

        User sender = loadUser(senderId);
        LocalDateTime now = LocalDateTime.now();

        // Use the role-specific ID as senderId for consistency
        String effectiveSenderId = senderId;
        if (sender instanceof Captain captain && captain.getCaptainId() != null) {
            effectiveSenderId = captain.getCaptainId();
        } else if (sender instanceof Player player && player.getPlayerId() != null) {
            effectiveSenderId = player.getPlayerId();
        } else if (sender instanceof Referee referee && referee.getRefereeId() != null) {
            effectiveSenderId = referee.getRefereeId();
        }
        
        // If senderId is generic userId but not in participants, use the generic userId
        if (!thread.getParticipants().contains(effectiveSenderId) && thread.getParticipants().contains(sender.getUserId())) {
            effectiveSenderId = sender.getUserId();
            System.out.println("[ChatService] sendMessage - using generic userId instead: " + effectiveSenderId);
        }
        
        System.out.println("[ChatService] sendMessage - effectiveSenderId: " + effectiveSenderId);

        ChatMessage message = new ChatMessage(
                null,
                threadId,
                effectiveSenderId,
                sender.getFullName(),
                getPhotoUrl(sender),
                content.trim(),
                now
        );
        ChatMessage saved = chatMessageRepository.save(message);
        System.out.println("[ChatService] sendMessage - message saved with ID: " + saved.getId());

        thread.setLastMessageAt(now);
        chatThreadRepository.save(thread);

        ChatMessageDto dto = toMessageDto(saved);
        messagingTemplate.convertAndSend("/topic/messages/" + threadId, dto);
        System.out.println("[ChatService] sendMessage - message sent to WebSocket topic: /topic/messages/" + threadId);
        return dto;
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private ChatThread loadThread(String threadId) {
        if (threadId == null || threadId.isBlank()) {
            throw new RuntimeException("Thread ID cannot be null.");
        }
        return chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Chat thread not found: " + threadId));
    }

    private void assertParticipant(ChatThread thread, String userId) {
        System.out.println("[ChatService] assertParticipant - userId: " + userId + ", thread participants: " + thread.getParticipants());
        
        // The userId passed in could be either the generic userId or role-specific ID
        // First check direct match
        if (thread.getParticipants().contains(userId)) {
            System.out.println("[ChatService] assertParticipant - direct match found");
            return;
        }
        
        // If not found, try to resolve the user and check their role-specific ID
        try {
            User user = loadUser(userId);
            String roleSpecificId = normalizeUserId(user);
            System.out.println("[ChatService] assertParticipant - roleSpecificId: " + roleSpecificId);
            if (thread.getParticipants().contains(roleSpecificId)) {
                System.out.println("[ChatService] assertParticipant - role-specific match found");
                return;
            }
        } catch (Exception e) {
            System.err.println("[ChatService] assertParticipant - user lookup failed: " + e.getMessage());
        }
        
        // If still not found, check if the userId is the generic userId and see if any participant matches it
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                String genericUserId = user.getUserId();
                System.out.println("[ChatService] assertParticipant - trying generic userId: " + genericUserId);
                if (thread.getParticipants().contains(genericUserId)) {
                    System.out.println("[ChatService] assertParticipant - generic userId match found");
                    return;
                }
            }
        } catch (Exception e) {
            System.err.println("[ChatService] assertParticipant - generic userId lookup failed: " + e.getMessage());
        }
        
        System.err.println("[ChatService] assertParticipant - NOT a participant. Thread participants: " + thread.getParticipants() + ", userId: " + userId);
        throw new RuntimeException("You are not a participant in this chat.");
    }
    
    private String normalizeUserId(User user) {
        if (user instanceof Captain captain && captain.getCaptainId() != null) {
            return captain.getCaptainId();
        } else if (user instanceof Player player && player.getPlayerId() != null) {
            return player.getPlayerId();
        } else if (user instanceof Referee referee && referee.getRefereeId() != null) {
            return referee.getRefereeId();
        }
        return user.getUserId();
    }

    private User loadUser(String userId) {
        System.out.println("[ChatService] loadUser called with userId: '" + userId + "'");
        if (userId == null || userId.isBlank()) {
            System.err.println("[ChatService] ERROR: User ID is null or blank!");
            throw new RuntimeException("User ID cannot be null.");
        }
        
        User user = null;
        
        // Try role-specific ID fields first using their specific repositories
        List<Captain> captains = captainRepository.findByCaptainId(userId);
        if (!captains.isEmpty()) {
            user = captains.get(0); // Take the first one if multiple exist
            System.out.println("[ChatService] loadUser - found " + captains.size() + " captains with captainId: " + userId);
        }
        if (user == null) {
            List<Player> players = playerRepository.findByPlayerId(userId);
            if (!players.isEmpty()) {
                user = players.get(0); // Take the first one if multiple exist
                System.out.println("[ChatService] loadUser - found " + players.size() + " players with playerId: " + userId);
            }
        }
        if (user == null) {
            List<Referee> referees = refereeRepository.findByRefereeId(userId);
            if (!referees.isEmpty()) {
                user = referees.get(0); // Take the first one if multiple exist
                System.out.println("[ChatService] loadUser - found " + referees.size() + " referees with refereeId: " + userId);
            }
        }
        
        // If not found by role-specific ID, try generic userId
        if (user == null) {
            user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                System.out.println("[ChatService] loadUser - found user by generic userId: " + userId);
            }
        }
        
        if (user == null) {
            throw new RuntimeException("User not found: " + userId);
        }
        
        System.out.println("[ChatService] loadUser found user: " + user.getUserId() + " (" + user.getRole() + ")");
        return user;
    }

    private Player loadPlayer(String userId) {
        User u = loadUser(userId);
        if (!(u instanceof Player)) {
            throw new RuntimeException("User is not a player: " + userId);
        }
        return (Player) u;
    }

    private boolean areFriends(String a, String b) {
        Optional<FriendRequest> ab = friendRequestRepository.findBySenderIdAndReceiverId(a, b);
        if (ab.isPresent() && ab.get().getStatus() == FriendRequest.Status.ACCEPTED) return true;
        Optional<FriendRequest> ba = friendRequestRepository.findBySenderIdAndReceiverId(b, a);
        return ba.isPresent() && ba.get().getStatus() == FriendRequest.Status.ACCEPTED;
    }

    private List<String> buildTeamParticipants(Team team) {
        List<String> participants = new ArrayList<>();
        // Use role-specific IDs for consistency
        if (team.getCaptainId() != null && !team.getCaptainId().isBlank()) {
            participants.add(team.getCaptainId());
            System.out.println("[ChatService] buildTeamParticipants - added captain: " + team.getCaptainId());
        }
        List<Player> players = playerRepository.findByTeamId(team.getId());
        System.out.println("[ChatService] buildTeamParticipants - found " + players.size() + " players for team: " + team.getId());
        players.stream()
                .filter(player -> player.getPlayerId() != null && !player.getPlayerId().isBlank())
                .forEach(player -> {
                    participants.add(player.getPlayerId());
                    System.out.println("[ChatService] buildTeamParticipants - added player: " + player.getPlayerId());
                });
        List<String> distinctParticipants = participants.stream().distinct().collect(Collectors.toList());
        System.out.println("[ChatService] buildTeamParticipants - final participants: " + distinctParticipants);
        return distinctParticipants;
    }

    private void syncTeamParticipants(ChatThread thread, Team team) {
        List<String> expected = buildTeamParticipants(team);
        if (!new HashSet<>(thread.getParticipants()).equals(new HashSet<>(expected))) {
            thread.setParticipants(expected);
            chatThreadRepository.save(thread);
        }
    }

    private String getPhotoUrl(User user) {
        if (user instanceof Player p) return p.getPhotoUrl();
        if (user instanceof Captain c) return c.getPhotoUrl();
        if (user instanceof Referee r) return r.getPhotoUrl();
        return null;
    }

    private ChatMessageDto toMessageDto(ChatMessage msg) {
        return new ChatMessageDto(
                msg.getId(),
                msg.getThreadId(),
                msg.getSenderId(),
                msg.getSenderName(),
                msg.getSenderPhotoUrl(),
                msg.getContent(),
                msg.getTimestamp()
        );
    }

    private ThreadSummaryDto toThreadSummary(ChatThread thread, String viewerId) {
        // Normalize viewerId to role-specific ID for comparison
        String normalizedViewerId = viewerId;
        try {
            User viewer = loadUser(viewerId);
            String tempNormalizedId = normalizeUserId(viewer);
            if (tempNormalizedId != null) {
                normalizedViewerId = tempNormalizedId;
            }
        } catch (Exception e) {
            // Keep original if lookup fails
        }
        
        final String finalNormalizedViewerId = normalizedViewerId;
        
        List<ParticipantDto> participants = thread.getParticipants().stream()
                .map(id -> {
                    User u = loadUser(id);
                    return new ParticipantDto(id, u.getFullName(), getPhotoUrl(u));
                })
                .collect(Collectors.toList());

        ChatMessageDto lastMessage = chatMessageRepository
                .findFirstByThreadIdOrderByTimestampDesc(thread.getId())
                .map(this::toMessageDto)
                .orElse(null);

        String displayName;
        String displayPhotoUrl = null;

        if (thread.getType() == ChatThread.Type.GROUP) {
            displayName = teamRepository.findById(thread.getTeamId())
                    .map(Team::getTeamName)
                    .orElse("Team Chat");
        } else {
            ParticipantDto other = participants.stream()
                    .filter(p -> !p.getUserId().equals(finalNormalizedViewerId))
                    .findFirst()
                    .orElse(null);
            displayName = other != null ? other.getFullName() : "Private Chat";
            displayPhotoUrl = other != null ? other.getPhotoUrl() : null;
        }

        return new ThreadSummaryDto(
                thread.getId(),
                thread.getType().name(),
                thread.getTeamId(),
                displayName,
                displayPhotoUrl,
                participants,
                lastMessage,
                thread.getLastMessageAt()
        );
    }
}
