package com.example.demo.controllers;

import com.example.demo.dto.AuthDtos.MessageResponse;
import com.example.demo.dto.ChatDtos.*;
import com.example.demo.entities.Captain;
import com.example.demo.entities.Player;
import com.example.demo.entities.Referee;
import com.example.demo.entities.User;
import com.example.demo.repositories.CaptainRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.RefereeRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService   chatService;
    private final UserRepository userRepository;
    private final CaptainRepository captainRepository;
    private final PlayerRepository playerRepository;
    private final RefereeRepository refereeRepository;

    @PostMapping("/threads/team/{teamId}")
    public ResponseEntity<ThreadIdResponse> createTeamThread(
            @PathVariable String teamId,
            Authentication authentication) {
        String userId = getCurrentUserId(authentication);
        System.out.println("[ChatController] createTeamThread - teamId: " + teamId + ", userId: " + userId);
        return ResponseEntity.ok(chatService.createTeamThread(teamId, userId));
    }

    @PostMapping("/threads/private")
    public ResponseEntity<ThreadIdResponse> createPrivateThread(
            @RequestBody CreatePrivateThreadRequest request,
            Authentication authentication) {
        String userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(chatService.createPrivateThread(userId, request.getOtherUserId()));
    }

    @GetMapping("/threads")
    public ResponseEntity<List<ThreadSummaryDto>> getThreads(Authentication authentication) {
        String userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(chatService.getThreadsForUser(userId));
    }

    @GetMapping("/threads/{threadId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(
            @PathVariable String threadId,
            Authentication authentication) {
        String userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(chatService.getMessages(threadId, userId));
    }

    @PostMapping("/threads/{threadId}/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(
            @PathVariable String threadId,
            @RequestBody SendMessageRequest request,
            Authentication authentication) {
        String userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(chatService.sendMessage(threadId, userId, request.getContent()));
    }

    private String getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        String userId = user.getUserId();
        
        // Use role-specific IDs for consistency with chat thread participants
        if (user instanceof Captain captain && captain.getCaptainId() != null && !captain.getCaptainId().isBlank()) {
            userId = captain.getCaptainId();
        } else if (user instanceof Player player && player.getPlayerId() != null && !player.getPlayerId().isBlank()) {
            userId = player.getPlayerId();
        } else if (user instanceof Referee referee && referee.getRefereeId() != null && !referee.getRefereeId().isBlank()) {
            userId = referee.getRefereeId();
        }
        
        if (userId == null || userId.isBlank()) {
            throw new RuntimeException("User ID is null for user: " + email + " (role: " + user.getRole() + ")");
        }
        
        return userId;
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<MessageResponse> handleError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }
}
