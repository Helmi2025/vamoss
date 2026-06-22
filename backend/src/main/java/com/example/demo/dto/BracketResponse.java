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
public class BracketResponse {
    private String tournamentId;
    private ParticipantType participantType;
    private ParticipantSummary champion;
    private BracketMatchNode finalMatch;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BracketMatchNode {
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

        private ParticipantSummary participant1;
        private ParticipantSummary participant2;
        private ParticipantSummary winner;

        private BracketMatchNode semiFinal1;
        private BracketMatchNode semiFinal2;
        private BracketMatchNode quarterFinal1;
        private BracketMatchNode quarterFinal2;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantSummary {
        private String id;
        private String name;
        private String logoUrl;
        /** Populated only for DOUBLES_TEAM entries — both player ids. */
        private String player1Id;
        private String player2Id;
        /** Photos for each player in a doubles pair (base64 data-URLs or null). */
        private String player1PhotoUrl;
        private String player2PhotoUrl;
    }
}
