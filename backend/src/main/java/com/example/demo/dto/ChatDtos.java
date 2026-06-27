package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ChatDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePrivateThreadRequest {
        private String otherUserId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendMessageRequest {
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessageDto {
        private String id;
        private String threadId;
        private String senderId;
        private String senderName;
        private String senderPhotoUrl;
        private String content;
        private LocalDateTime timestamp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantDto {
        private String userId;
        private String fullName;
        private String photoUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThreadSummaryDto {
        private String id;
        private String type;
        private String teamId;
        private String displayName;
        private String displayPhotoUrl;
        private List<ParticipantDto> participants;
        private ChatMessageDto lastMessage;
        private LocalDateTime lastMessageAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThreadIdResponse {
        private String threadId;
    }
}
