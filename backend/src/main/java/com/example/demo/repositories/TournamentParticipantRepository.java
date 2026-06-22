package com.example.demo.repositories;

import com.example.demo.entities.TournamentParticipant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentParticipantRepository extends MongoRepository<TournamentParticipant, String> {
    List<TournamentParticipant> findByTournamentId(String tournamentId);
    boolean existsByTournamentIdAndParticipantId(String tournamentId, String participantId);
    void deleteByTournamentIdAndParticipantId(String tournamentId, String participantId);
    void deleteByTournamentId(String tournamentId);

    List<TournamentParticipant> findByParticipantId(String participantId);
    List<TournamentParticipant> findByParticipantIdIn(List<String> participantIds);
}
