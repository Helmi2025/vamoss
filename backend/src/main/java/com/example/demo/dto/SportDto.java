package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SportDto {
    private String id;
    private String sportName;
    // Full URL to retrieve the icon via GridFS endpoint
    private String iconUrl;
    private String scoringRule;
    private int maxPlayers;
    private boolean teamEnabled;
}
