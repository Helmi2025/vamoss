package com.example.demo.repositories;

import com.example.demo.entities.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findByThreadIdOrderByTimestampAsc(String threadId);

    Optional<ChatMessage> findFirstByThreadIdOrderByTimestampDesc(String threadId);
}
