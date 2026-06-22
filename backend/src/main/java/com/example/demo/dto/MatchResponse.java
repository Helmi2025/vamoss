package com.example.demo.dto;

import com.example.demo.tournament.MatchRound;
import com.example.demo.tournament.MatchStatus;
import com.example.demo.tournament.ParticipantType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
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
