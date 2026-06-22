package com.example.demo.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "teams")
public class Team {

    @Id
    private String id;

    private String teamName;

    // Reference to Sport document
    private String sportId;

    // Reference to the captain who manages this team
    private String captainId;

    // GridFS file ID for the team logo
    private String logoFileId;

    private LocalDateTime createdAt = LocalDateTime.now();
}
