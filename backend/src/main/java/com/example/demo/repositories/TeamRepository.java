package com.example.demo.repositories;

import com.example.demo.entities.Team;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends MongoRepository<Team, String> {
    Optional<Team> findByCaptainId(String captainId);
    List<Team> findBySportId(String sportId);
    boolean existsByTeamName(String teamName);
}
