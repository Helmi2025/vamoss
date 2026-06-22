package com.example.demo.services;

import com.example.demo.dto.AdminTeamDto.*;
import com.example.demo.entities.Captain;
import com.example.demo.entities.Player;
import com.example.demo.entities.Team;
import com.example.demo.entities.User;
import com.example.demo.repositories.CaptainRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminTeamService {

    private final TeamRepository    teamRepository;
    private final CaptainRepository captainRepository;
    private final PlayerRepository  playerRepository;
    private final SportService      sportService;

    @Value("${app.base-url}")
    private String baseUrl;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String resolveSportName(String sportId) {
        if (sportId == null) return "–";
        try { return sportService.getById(sportId).getSportName(); }
        catch (Exception e) { return "–"; }
    }

    private String buildLogoUrl(String logoFileId) {
        return logoFileId != null
                ? baseUrl + "/api/captain/team/logo/" + logoFileId
                : null;
    }

    // ── List all teams (optionally filtered by sportId) ───────────────────────

    public List<TeamSummary> getAllTeams(String sportId) {
        List<Team> teams = (sportId != null && !sportId.isBlank())
                ? teamRepository.findBySportId(sportId)
                : teamRepository.findAll();

        return teams.stream()
                .filter(team -> {
                    if (team.getCaptainId() == null) return true;
                    return captainRepository.findById(team.getCaptainId())
                            .map(captain -> captain.getAccountStatus() == User.AccountStatus.ACTIVE)
                            .orElse(true);
                })
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    // ── Get full details for one team ─────────────────────────────────────────

    public TeamDetails getTeamDetails(String teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));

        String sportName = resolveSportName(team.getSportId());

        // Captain
        CaptainInfo captainInfo = null;
        if (team.getCaptainId() != null) {
            try {
                Captain captain = captainRepository.findById(team.getCaptainId())
                        .orElseThrow();
                captainInfo = new CaptainInfo(
                        captain.getCaptainId(),
                        captain.getFullName(),
                        captain.getPhotoUrl()   // base64 stored inline
                );
            } catch (Exception ignored) {}
        }

        // Players — exclude the captain by filtering on PLAYER role only
        List<PlayerInfo> players = playerRepository.findByTeamId(teamId)
                .stream()
                .filter(p -> p.getRole() == User.Role.PLAYER)
                .map(p -> new PlayerInfo(p.getPlayerId(), p.getFullName(), p.getPhotoUrl()))
                .collect(Collectors.toList());

        return new TeamDetails(
                team.getId(),
                team.getTeamName(),
                team.getSportId(),
                sportName,
                buildLogoUrl(team.getLogoFileId()),
                captainInfo,
                players,
                team.getCreatedAt()
        );
    }

    // ── Map Team → TeamSummary ─────────────────────────────────────────────────

    private TeamSummary toSummary(Team team) {
        int playerCount = (int) playerRepository.findByTeamId(team.getId())
                .stream()
                .filter(p -> p.getRole() == User.Role.PLAYER)
                .count();
        return new TeamSummary(
                team.getId(),
                team.getTeamName(),
                team.getSportId(),
                resolveSportName(team.getSportId()),
                buildLogoUrl(team.getLogoFileId()),
                playerCount,
                team.getCreatedAt()
        );
    }
}
