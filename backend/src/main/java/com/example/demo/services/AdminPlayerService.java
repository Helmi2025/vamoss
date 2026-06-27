package com.example.demo.services;

import com.example.demo.dto.AdminPlayerDto.*;
import com.example.demo.entities.Player;
import com.example.demo.entities.Team;
import com.example.demo.entities.User;
import com.example.demo.repositories.TeamRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPlayerService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final SportService   sportService;
    private final ChatService    chatService;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String resolveSportName(String sportId) {
        if (sportId == null) return "–";
        try { return sportService.getById(sportId).getSportName(); }
        catch (Exception e) { return "–"; }
    }

    private String resolvePlayerSportId(Player player) {
        if (player.getSportId() != null) return player.getSportId();
        if (player.getTeamId() != null) {
            return teamRepository.findById(player.getTeamId())
                    .map(Team::getSportId)
                    .orElse(null);
        }
        return null;
    }

    // ── List all active players, including individual and team-sport players ──

    public List<PlayerSummary> getAllPlayers(String sportId, String name) {
        List<Player> players = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.PLAYER
                          && u.getAccountStatus() == User.AccountStatus.ACTIVE)
                .map(u -> (Player) u)
                .collect(Collectors.toList());

        if (sportId != null && !sportId.isBlank()) {
            players = players.stream()
                    .filter(p -> sportId.equals(resolvePlayerSportId(p)))
                    .collect(Collectors.toList());
        }

        if (name != null && !name.isBlank()) {
            String lower = name.trim().toLowerCase();
            players = players.stream()
                    .filter(p -> p.getFullName() != null &&
                                 p.getFullName().toLowerCase().contains(lower))
                    .collect(Collectors.toList());
        }

        return players.stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    // ── Get full details for one player ───────────────────────────────────────

    public PlayerDetails getPlayerDetails(String playerId) {
        User user = userRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found: " + playerId));
        if (!(user instanceof Player)) {
            throw new RuntimeException("User is not a player: " + playerId);
        }
        Player player = (Player) user;

        String effectiveSportId = resolvePlayerSportId(player);
        String sportName = resolveSportName(effectiveSportId);

        return new PlayerDetails(
                player.getPlayerId(),
                player.getFullName(),
                player.getEmail(),
                player.getPhoneNumber(),
                player.getPhotoUrl(),
                effectiveSportId,
                sportName,
                player.getAppliedAt(),
                player.getGender()
        );
    }

    // ── Map Player → PlayerSummary ─────────────────────────────────────────────

    private PlayerSummary toSummary(Player player) {
        String effectiveSportId = resolvePlayerSportId(player);
        return new PlayerSummary(
                player.getPlayerId(),
                player.getFullName(),
                player.getPhotoUrl(),
                effectiveSportId,
                resolveSportName(effectiveSportId),
                player.getAppliedAt(),
                player.getGender()
        );
    }

    // ── Delete a player ───────────────────────────────────────────────────────

    public void deletePlayer(String playerId) {
        User user = userRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found: " + playerId));
        if (!(user instanceof Player player)) {
            throw new RuntimeException("User is not a player: " + playerId);
        }
        if (player.getTeamId() != null) {
            chatService.removeParticipantFromTeamThread(player.getTeamId(), playerId);
        }
        userRepository.deleteById(playerId);
    }
}
