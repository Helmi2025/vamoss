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
public class TodayMatchDto {
    private String id;
    private String tournamentId;
    private String tournamentName;
    private String sportId;
    private MatchRound round;
    private int matchNumber;

    private String participant1Id;
    private ParticipantType participant1Type;
    private String participant1Name;
    private String participant1LogoUrl;

    private String participant2Id;
    private ParticipantType participant2Type;
    private String participant2Name;
    private String participant2LogoUrl;

    private Integer score1;
    private Integer score2;
    private String winnerId;
    private MatchStatus status;
    private LocalDateTime scheduledDate;
    private String fieldId;
}
