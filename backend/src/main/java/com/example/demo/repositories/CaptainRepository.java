package com.example.demo.repositories;

import com.example.demo.entities.Captain;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CaptainRepository extends MongoRepository<Captain, String> {

    Optional<Captain> findByEmail(String email);
    List<Captain> findByCaptainId(String captainId);
}
