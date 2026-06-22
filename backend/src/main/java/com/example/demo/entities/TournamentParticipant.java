package com.example.demo.entities;

import com.example.demo.tournament.ParticipantType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tournament_participants")
@CompoundIndex(def = "{'tournamentId': 1, 'participantId': 1}", unique = true)
public class TournamentParticipant {

    @Id
    private String id;

    private String tournamentId;

    private String participantId;

    private ParticipantType participantType;
}
