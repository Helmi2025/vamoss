package com.example.demo.repositories;

import com.example.demo.entities.Player;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends MongoRepository<Player, String> {

    Optional<Player> findByEmail(String email);

    List<Player> findByTeamId(String teamId);

    List<Player> findBySportId(String sportId);

    Optional<Player> findByCaptainIdAndPlayerId(String captainId, String playerId);
    
    List<Player> findByPlayerId(String playerId);
}
