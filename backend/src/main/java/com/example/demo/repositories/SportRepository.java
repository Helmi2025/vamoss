package com.example.demo.repositories;

import com.example.demo.entities.Sport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SportRepository extends MongoRepository<Sport, String> {
    boolean existsBySportName(String sportName);
    List<Sport> findBySportNameIn(List<String> names);
}
