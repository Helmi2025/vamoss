package com.example.demo.services;

import com.example.demo.dto.StatsDtos;
import com.example.demo.entities.*;
import com.example.demo.repositories.*;
import com.example.demo.tournament.MatchStatus;
import com.example.demo.tournament.ParticipantType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final TournamentRepository tournamentRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final TournamentParticipantRepository tournamentParticipantRepository;
    private final DoublesTeamRepository doublesTeamRepository;
    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final SportRepository sportRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    public StatsDtos.ParticipantStatsDto getTeamStats(String teamId) {
        List<Tournament> won = tournamentRepository.findAll().stream()
                .filter(t -> t.getChampionId() != null 
                        && t.getChampionId().equals(teamId) 
                        && t.getChampionType() == ParticipantType.TEAM)
                .collect(Collectors.toList());

        List<TournamentParticipant> participations = tournamentParticipantRepository.findByParticipantId(teamId);
        int totalGoals = 0;
        for (TournamentParticipant part : participations) {
            List<TournamentMatch> matches = tournamentMatchRepository.findByTournamentId(part.getTournamentId());
            for (TournamentMatch m : matches) {
                if (m.getStatus() == MatchStatus.PLAYED) {
                    if (teamId.equals(m.getParticipant1Id()) && m.getScore1() != null) {
                        totalGoals += m.getScore1();
                    } else if (teamId.equals(m.getParticipant2Id()) && m.getScore2() != null) {
                        totalGoals += m.getScore2();
                    }
                }
            }
        }

        List<StatsDtos.TournamentStatDto> wonList = new ArrayList<>();
        for (Tournament t : won) {
            int goalsInTourney = 0;
            List<TournamentMatch> matches = tournamentMatchRepository.findByTournamentId(t.getId());
            for (TournamentMatch m : matches) {
                if (m.getStatus() == MatchStatus.PLAYED) {
                    if (teamId.equals(m.getParticipant1Id()) && m.getScore1() != null) {
                        goalsInTourney += m.getScore1();
                    } else if (teamId.equals(m.getParticipant2Id()) && m.getScore2() != null) {
                        goalsInTourney += m.getScore2();
                    }
                }
            }
            wonList.add(new StatsDtos.TournamentStatDto(
                    t.getId(),
                    t.getName(),
                    t.getStartDate() != null ? t.getStartDate().toString() : "",
                    goalsInTourney
            ));
        }

        return new StatsDtos.ParticipantStatsDto(won.size(), totalGoals, wonList);
    }

    private int computeGoalsForParticipantInTournament(String participantId, String tournamentId) {
        List<TournamentMatch> matches = tournamentMatchRepository.findByTournamentId(tournamentId);
        int goals = 0;
        for (TournamentMatch m : matches) {
            if (m.getStatus() == MatchStatus.PLAYED) {
                if (participantId.equals(m.getParticipant1Id()) && m.getScore1() != null) {
                    goals += m.getScore1();
                } else if (participantId.equals(m.getParticipant2Id()) && m.getScore2() != null) {
                    goals += m.getScore2();
                }
            }
        }
        return goals;
    }

    public StatsDtos.ParticipantStatsDto getPlayerStats(String playerId) {
        List<DoublesTeam> playerDoubles = doublesTeamRepository.findByPlayerId(playerId);
        List<String> doublesTeamIds = playerDoubles.stream().map(DoublesTeam::getId).collect(Collectors.toList());

        List<Tournament> won = tournamentRepository.findAll().stream()
                .filter(t -> t.getChampionId() != null && (
                        (t.getChampionId().equals(playerId) && t.getChampionType() == ParticipantType.PLAYER)
                        || (doublesTeamIds.contains(t.getChampionId()) && t.getChampionType() == ParticipantType.DOUBLES_TEAM)
                ))
                .collect(Collectors.toList());

        List<String> pIds = new ArrayList<>();
        pIds.add(playerId);
        pIds.addAll(doublesTeamIds);
        List<TournamentParticipant> participations = tournamentParticipantRepository.findByParticipantIdIn(pIds);

        int totalGoals = 0;
        for (TournamentParticipant part : participations) {
            String partId = part.getParticipantId();
            List<TournamentMatch> matches = tournamentMatchRepository.findByTournamentId(part.getTournamentId());
            for (TournamentMatch m : matches) {
                if (m.getStatus() == MatchStatus.PLAYED) {
                    if (partId.equals(m.getParticipant1Id()) && m.getScore1() != null) {
                        totalGoals += m.getScore1();
                    } else if (partId.equals(m.getParticipant2Id()) && m.getScore2() != null) {
                        totalGoals += m.getScore2();
                    }
                }
            }
        }

        List<StatsDtos.TournamentStatDto> wonList = new ArrayList<>();
        for (Tournament t : won) {
            String partId = playerId;
            if (t.getChampionType() == ParticipantType.DOUBLES_TEAM) {
                partId = playerDoubles.stream()
                        .filter(dt -> dt.getTournamentId().equals(t.getId()))
                        .map(DoublesTeam::getId)
                        .findFirst()
                        .orElse(null);
            }
            int goalsInTourney = 0;
            if (partId != null) {
                List<TournamentMatch> matches = tournamentMatchRepository.findByTournamentId(t.getId());
                for (TournamentMatch m : matches) {
                    if (m.getStatus() == MatchStatus.PLAYED) {
                        if (partId.equals(m.getParticipant1Id()) && m.getScore1() != null) {
                            goalsInTourney += m.getScore1();
                        } else if (partId.equals(m.getParticipant2Id()) && m.getScore2() != null) {
                            goalsInTourney += m.getScore2();
                        }
                    }
                }
            }
            wonList.add(new StatsDtos.TournamentStatDto(
                    t.getId(),
                    t.getName(),
                    t.getStartDate() != null ? t.getStartDate().toString() : "",
                    goalsInTourney
            ));
        }

        return new StatsDtos.ParticipantStatsDto(won.size(), totalGoals, wonList);
    }

    public List<StatsDtos.TeamRankingDto> getRankings() {
        List<Sport> sports = sportRepository.findAll();
        List<StatsDtos.TeamRankingDto> rankings = new ArrayList<>();

        for (Sport sport : sports) {
            if (sport.isTeamEnabled()) {
                List<Team> teams = teamRepository.findBySportId(sport.getId());
                for (Team team : teams) {
                    int wonCount = (int) tournamentRepository.findAll().stream()
                            .filter(t -> t.getChampionId() != null
                                    && t.getChampionId().equals(team.getId())
                                    && t.getChampionType() == ParticipantType.TEAM)
                            .count();

                    List<TournamentParticipant> parts = tournamentParticipantRepository.findByParticipantId(team.getId());
                    int totalGoals = 0;
                    for (TournamentParticipant part : parts) {
                        List<TournamentMatch> matches = tournamentMatchRepository.findByTournamentId(part.getTournamentId());
                        for (TournamentMatch m : matches) {
                            if (m.getStatus() == MatchStatus.PLAYED) {
                                if (team.getId().equals(m.getParticipant1Id()) && m.getScore1() != null) {
                                    totalGoals += m.getScore1();
                                } else if (team.getId().equals(m.getParticipant2Id()) && m.getScore2() != null) {
                                    totalGoals += m.getScore2();
                                }
                            }
                        }
                    }

                    String logoUrl = team.getLogoFileId() != null
                            ? baseUrl + "/api/captain/team/logo/" + team.getLogoFileId()
                            : null;

                    rankings.add(new StatsDtos.TeamRankingDto(
                            team.getId(),
                            team.getTeamName(),
                            sport.getSportName(),
                            sport.getId(),
                            logoUrl,
                            wonCount,
                            totalGoals
                    ));
                }
            } else {
                List<Player> players = playerRepository.findBySportId(sport.getId());
                for (Player player : players) {
                    if (player.getAccountStatus() != User.AccountStatus.ACTIVE) {
                        continue;
                    }
                    StatsDtos.ParticipantStatsDto stats = getPlayerStats(player.getPlayerId());
                    rankings.add(new StatsDtos.TeamRankingDto(
                            player.getPlayerId(),
                            player.getFullName(),
                            sport.getSportName(),
                            sport.getId(),
                            player.getPhotoUrl(),
                            stats.getTournamentsWonCount(),
                            stats.getTotalGoalsScored()
                    ));
                }
            }
        }

        rankings.sort((a, b) -> {
            if (a.getTournamentsWonCount() != b.getTournamentsWonCount()) {
                return Integer.compare(b.getTournamentsWonCount(), a.getTournamentsWonCount());
            }
            if (a.getTotalGoalsScored() != b.getTotalGoalsScored()) {
                return Integer.compare(b.getTotalGoalsScored(), a.getTotalGoalsScored());
            }
            return a.getTeamName().compareToIgnoreCase(b.getTeamName());
        });

        return rankings;
    }

    public StatsDtos.TeamProfileDto getTeamProfile(String teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));

        Sport sport = sportRepository.findById(team.getSportId()).orElse(null);
        String sportName = sport != null ? sport.getSportName() : "–";

        StatsDtos.ParticipantStatsDto stats = getTeamStats(teamId);

        List<StatsDtos.TournamentStatDto> participated = new ArrayList<>();
        List<TournamentParticipant> parts = tournamentParticipantRepository.findByParticipantId(teamId);
        for (TournamentParticipant part : parts) {
            Tournament tournament = tournamentRepository.findById(part.getTournamentId()).orElse(null);
            if (tournament == null) continue;
            int goals = computeGoalsForParticipantInTournament(teamId, tournament.getId());
            participated.add(new StatsDtos.TournamentStatDto(
                    tournament.getId(),
                    tournament.getName(),
                    tournament.getStartDate() != null ? tournament.getStartDate().toString() : "",
                    goals
            ));
        }
        participated.sort((a, b) -> b.getStartDate().compareTo(a.getStartDate()));

        int rank = computeTeamRank(team);

        String logoUrl = team.getLogoFileId() != null
                ? baseUrl + "/api/captain/team/logo/" + team.getLogoFileId()
                : null;

        return new StatsDtos.TeamProfileDto(
                team.getId(),
                team.getTeamName(),
                sportName,
                logoUrl,
                rank,
                stats.getTournamentsWonCount(),
                stats.getTotalGoalsScored(),
                stats.getWonTournaments(),
                participated
        );
    }

    private int computeTeamRank(Team team) {
        List<Team> sameSportTeams = teamRepository.findBySportId(team.getSportId());
        StatsDtos.ParticipantStatsDto stats = getTeamStats(team.getId());
        int rank = 1;
        for (Team other : sameSportTeams) {
            if (other.getId().equals(team.getId())) continue;
            StatsDtos.ParticipantStatsDto otherStats = getTeamStats(other.getId());
            int cmp = Integer.compare(otherStats.getTournamentsWonCount(), stats.getTournamentsWonCount());
            if (cmp == 0) {
                cmp = Integer.compare(otherStats.getTotalGoalsScored(), stats.getTotalGoalsScored());
            }
            if (cmp == 0) {
                cmp = other.getTeamName().compareToIgnoreCase(team.getTeamName());
            }
            if (cmp > 0) rank++;
        }
        return rank;
    }
}
