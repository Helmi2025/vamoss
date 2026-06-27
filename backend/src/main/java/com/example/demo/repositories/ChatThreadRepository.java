package com.example.demo.repositories;

import com.example.demo.entities.ChatThread;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatThreadRepository extends MongoRepository<ChatThread, String> {

    List<ChatThread> findByParticipantsContaining(String userId);

    Optional<ChatThread> findByTeamIdAndType(String teamId, ChatThread.Type type);

    @Query("{ 'type': 'PRIVATE', 'participants': { $all: [?0, ?1], $size: 2 } }")
    Optional<ChatThread> findPrivateThreadBetween(String userId1, String userId2);
}
