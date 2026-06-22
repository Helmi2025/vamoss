package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

public class StatsDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TournamentStatDto {
        private String tournamentId;
        private String tournamentName;
        private String startDate;
        private int goalsScored;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantStatsDto {
        private int tournamentsWonCount;
        private int totalGoalsScored;
        private List<TournamentStatDto> wonTournaments;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamRankingDto {
        private String teamId;
        private String teamName;
        private String sportName;
        private String sportId;
        private String logoUrl;
        private int tournamentsWonCount;
        private int totalGoalsScored;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamProfileDto {
        private String teamId;
        private String teamName;
        private String sportName;
        private String logoUrl;
        private int rank;
        private int tournamentsWonCount;
        private int totalGoalsScored;
        private List<TournamentStatDto> wonTournaments;
        private List<TournamentStatDto> participatedTournaments;
    }
}
