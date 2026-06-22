package com.example.demo.repositories;

import com.example.demo.entities.DoublesTeam;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoublesTeamRepository extends MongoRepository<DoublesTeam, String> {

    List<DoublesTeam> findByTournamentId(String tournamentId);

    /** Check if a player (as player1 or player2) is already in the tournament. */
    @Query("{ 'tournamentId': ?0, '$or': [ { 'player1Id': ?1 }, { 'player2Id': ?1 } ] }")
    Optional<DoublesTeam> findByTournamentIdAndPlayer(String tournamentId, String playerId);

    /** Delete all doubles teams for a tournament (used when tournament is deleted). */
    void deleteByTournamentId(String tournamentId);

    @Query("{ '$or': [ { 'player1Id': ?0 }, { 'player2Id': ?0 } ] }")
    List<DoublesTeam> findByPlayerId(String playerId);
}
