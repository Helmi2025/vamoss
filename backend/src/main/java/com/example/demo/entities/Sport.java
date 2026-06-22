package com.example.demo.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@Document(collection = "sports")
public class Sport {

    @Id
    private String id;

    private String sportName;

    private String iconFileId;

    private String scoringRule;

    private int maxPlayers;

    // Not stored — derived from name at runtime. Kept for DTO mapping only.
    private boolean teamEnabled;

    public Sport(String id, String sportName, String iconFileId,
                 String scoringRule, int maxPlayers, boolean teamEnabled) {
        this.id          = id;
        this.sportName   = sportName;
        this.iconFileId  = iconFileId;
        this.scoringRule = scoringRule;
        this.maxPlayers  = maxPlayers;
        this.teamEnabled = teamEnabled;
    }
}
