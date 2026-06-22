package com.example.demo.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "fields")
public class Field {

    @Id
    private String id;

    private String name;

    private boolean isAvailable = true;

    // Reference to Sport document
    private String sportId;
}