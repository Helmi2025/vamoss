package com.example.demo.repositories;

import com.example.demo.entities.Field;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FieldRepository extends MongoRepository<Field, String> {

    List<Field> findBySportId(String sportId);

    List<Field> findByIsAvailable(boolean isAvailable);

    List<Field> findBySportIdAndIsAvailable(String sportId, boolean isAvailable);

    boolean existsByNameAndSportId(String name, String sportId);
}
