package com.example.demo.repositories;

import com.example.demo.entities.Tournament;
import com.example.demo.tournament.TournamentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRepository extends MongoRepository<Tournament, String> {
    List<Tournament> findBySportId(String sportId);
    List<Tournament> findByStatus(TournamentStatus status);
}
