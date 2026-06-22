package com.example.demo.services;

import com.example.demo.dto.AdminCaptainDto.*;
import com.example.demo.entities.Captain;
import com.example.demo.entities.Team;
import com.example.demo.entities.User;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.TeamRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminCaptainService {

    private final UserRepository    userRepository;
    private final TeamRepository    teamRepository;
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

    // ── List all active captains (optionally filtered by sportId) ─────────────

    public List<CaptainSummary> getAllCaptains(String sportId, String name) {
        // Use UserRepository + role filter — same pattern as CaptainApplicationService
        // to avoid CaptainRepository.findAll() returning all users collection docs
        List<Captain> captains = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.CAPTAIN
                          && u.getAccountStatus() == User.AccountStatus.ACTIVE)
                .map(u -> (Captain) u)
                .collect(Collectors.toList());

        // Optional sport filter — resolve via the captain's team
        if (sportId != null && !sportId.isBlank()) {
            captains = captains.stream()
                    .filter(c -> {
                        if (c.getTeamId() == null) return false;
                        return teamRepository.findById(c.getTeamId())
                                .map(t -> sportId.equals(t.getSportId()))
                                .orElse(false);
                    })
                    .collect(Collectors.toList());
        }

        // Optional name filter (case-insensitive)
        if (name != null && !name.isBlank()) {
            String lower = name.trim().toLowerCase();
            captains = captains.stream()
                    .filter(c -> c.getFullName() != null &&
                                 c.getFullName().toLowerCase().contains(lower))
                    .collect(Collectors.toList());
        }

        return captains.stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    // ── Get full details for one captain ──────────────────────────────────────

    public CaptainDetails getCaptainDetails(String captainId) {
        User user = userRepository.findById(captainId)
                .orElseThrow(() -> new RuntimeException("Captain not found: " + captainId));
        if (!(user instanceof Captain)) {
            throw new RuntimeException("User is not a captain: " + captainId);
        }
        Captain captain = (Captain) user;

        String sportId   = null;
        String sportName = "–";
        String teamId    = captain.getTeamId();
        String teamName  = null;
        String logoUrl   = null;
        int    playerCount = 0;

        if (teamId != null) {
            Team team = teamRepository.findById(teamId).orElse(null);
            if (team != null) {
                sportId    = team.getSportId();
                sportName  = resolveSportName(sportId);
                teamName   = team.getTeamName();
                logoUrl    = buildLogoUrl(team.getLogoFileId());
                playerCount = (int) playerRepository.findByTeamId(teamId)
                        .stream()
                        .filter(p -> p.getRole() == User.Role.PLAYER)
                        .count();
            }
        }

        return new CaptainDetails(
                captain.getCaptainId(),
                captain.getFullName(),
                captain.getEmail(),
                captain.getPhoneNumber(),
                captain.getPhotoUrl(),
                sportId,
                sportName,
                teamId,
                teamName,
                logoUrl,
                playerCount,
                captain.getAppliedAt()
        );
    }

    // ── Map Captain → CaptainSummary ──────────────────────────────────────────

    private CaptainSummary toSummary(Captain captain) {
        String sportId   = null;
        String sportName = "–";
        String teamId    = captain.getTeamId();
        String teamName  = null;

        if (teamId != null) {
            Team team = teamRepository.findById(teamId).orElse(null);
            if (team != null) {
                sportId   = team.getSportId();
                sportName = resolveSportName(sportId);
                teamName  = team.getTeamName();
            }
        }

        return new CaptainSummary(
                captain.getCaptainId(),
                captain.getFullName(),
                captain.getPhotoUrl(),
                sportId,
                sportName,
                teamId,
                teamName,
                captain.getAppliedAt()
        );
    }
}
