package com.example.demo.dto;

import com.example.demo.tournament.ParticipantType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentParticipantResponse {
    private String id;
    private String tournamentId;
    private String participantId;
    private ParticipantType participantType;
}
