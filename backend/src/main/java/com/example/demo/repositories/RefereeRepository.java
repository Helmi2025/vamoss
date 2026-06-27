package com.example.demo.repositories;

import com.example.demo.entities.Referee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefereeRepository extends MongoRepository<Referee, String> {

    Optional<Referee> findByEmail(String email);
    List<Referee> findByRefereeId(String refereeId);
}
