package com.example.demo.entities;

import com.example.demo.tournament.MatchRound;
import com.example.demo.tournament.MatchStatus;
import com.example.demo.tournament.ParticipantType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "matches")
@CompoundIndex(def = "{'tournamentId': 1}")
public class TournamentMatch {

    @Id
    private String id;

    private String tournamentId;

    private MatchRound round;

    private int matchNumber;

    private String participant1Id;

    private ParticipantType participant1Type;

    private String participant2Id;

    private ParticipantType participant2Type;

    private Integer score1;

    private Integer score2;

    private String winnerId;

    private ParticipantType winnerType;

    private MatchStatus status;

    private String nextMatchId;

    private Integer nextMatchPosition;

    private LocalDateTime scheduledDate;

    private String fieldId;

    private LocalDateTime createdAt;
}
