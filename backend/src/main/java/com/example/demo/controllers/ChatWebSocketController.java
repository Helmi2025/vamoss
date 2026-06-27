package com.example.demo.controllers;

import com.example.demo.dto.ChatDtos.SendMessageRequest;
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
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final CaptainRepository captainRepository;
    private final PlayerRepository playerRepository;
    private final RefereeRepository refereeRepository;

    @MessageMapping("/chat/{threadId}/send")
    public void sendViaWebSocket(
            @DestinationVariable String threadId,
            @Payload SendMessageRequest request,
            Principal principal) {
        if (principal == null) return;
        String userId = principal.getName();
        
        // The userId from principal is already the role-specific ID from JWT
        // We need to find the user using role-specific repositories
        User user = null;
        
        List<Captain> captains = captainRepository.findByCaptainId(userId);
        if (!captains.isEmpty()) {
            user = captains.get(0);
        }
        if (user == null) {
            List<Player> players = playerRepository.findByPlayerId(userId);
            if (!players.isEmpty()) {
                user = players.get(0);
            }
        }
        if (user == null) {
            List<Referee> referees = refereeRepository.findByRefereeId(userId);
            if (!referees.isEmpty()) {
                user = referees.get(0);
            }
        }
        if (user == null) {
            user = userRepository.findById(userId).orElse(null);
        }
        
        if (user != null) {
            // Use the role-specific ID that was passed in
            chatService.sendMessage(threadId, userId, request.getContent());
        }
    }
}
