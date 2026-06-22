package com.example.demo.services;

import com.example.demo.dto.AuthDtos.PlayerProfileUpdateRequest;
import com.example.demo.dto.FriendDto;
import com.example.demo.dto.PlayerExploreDto;
import com.example.demo.dto.TeamManagementDtos.*;
import com.example.demo.entities.Captain;
import com.example.demo.entities.Player;
import com.example.demo.entities.Team;
import com.example.demo.entities.User;
import com.example.demo.repositories.CaptainRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.TeamRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository  playerRepository;
    private final CaptainRepository captainRepository;
    private final TeamRepository    teamRepository;
    private final UserRepository    userRepository;
    private final SportService      sportService;
    private final FriendService     friendService;
    private final PasswordEncoder   passwordEncoder;

    @Value("${app.base-url}")
    private String baseUrl;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Player findPlayer(String playerId) {
        Player p = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));
        // Re-fetch by email so passwordHash is correctly deserialized
        return playerRepository.findByEmail(p.getEmail())
                .orElseThrow(() -> new RuntimeException("Player not found"));
    }

    private String buildLogoUrl(String logoFileId) {
        return logoFileId != null
                ? baseUrl + "/api/captain/team/logo/" + logoFileId
                : null;
    }

    // ── GET team view ─────────────────────────────────────────────────────────

    /**
     * Returns everything the player needs to render their "Team" tab.
     * {@code requestingUserId} is the JWT userId (= MongoDB _id of the player doc).
     */
    public PlayerTeamViewDto getTeamView(String requestingUserId) {
        // Load by userId (_id), not playerId, to be safe
        Player player = playerRepository.findById(requestingUserId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (player.getTeamId() == null) {
            throw new RuntimeException("You are not currently assigned to a team.");
        }

        Team team = teamRepository.findById(player.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Sport name
        String sportName = "–";
        if (team.getSportId() != null) {
            try { sportName = sportService.getById(team.getSportId()).getSportName(); }
            catch (Exception ignored) {}
        }
        // Captain info
        Captain captain = captainRepository.findById(team.getCaptainId())
                .orElseThrow(() -> new RuntimeException("Captain not found"));

        // Player roster — only PLAYER-role documents (never the captain)
        // isSelf: compare each player's _id (getUserId()) to the requesting player's _id
        List<PlayerCardDto> playerCards = playerRepository.findByTeamId(team.getId())
                .stream()
                .filter(p -> p.getRole() == com.example.demo.entities.User.Role.PLAYER)
                .map(p -> new PlayerCardDto(
                        p.getUserId(),
                        p.getFullName(),
                        p.getPhotoUrl(),
                        requestingUserId.equals(p.getUserId())
                ))
                .collect(Collectors.toList());

        // Format creation date
        String createdAt = team.getCreatedAt() != null
                ? team.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"))
                : "–";

        return new PlayerTeamViewDto(
                team.getId(),
                team.getTeamName(),
                sportName,
                team.getSportId(),
                buildLogoUrl(team.getLogoFileId()),
                createdAt,
                captain.getCaptainId(),
                captain.getFullName(),
                captain.getPhotoUrl(),
                playerCards
        );
    }

    // ── UPDATE profile ────────────────────────────────────────────────────────

    public void updateProfile(String playerId, PlayerProfileUpdateRequest req) {
        Player player = findPlayer(playerId);

        if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
            throw new RuntimeException("Current password is required to save changes.");
        }

        if (!passwordEncoder.matches(req.getCurrentPassword(), player.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect.");
        }

        boolean changed = false;

        if (req.getNewFullName() != null && !req.getNewFullName().isBlank()) {
            player.setFullName(req.getNewFullName().trim());
            changed = true;
        }

        if (req.getNewEmail() != null && !req.getNewEmail().isBlank()) {
            String newEmail = req.getNewEmail().trim();
            if (!newEmail.equals(player.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new RuntimeException("Email already in use: " + newEmail);
                }
                player.setEmail(newEmail);
                changed = true;
            }
        }

        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            player.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
            changed = true;
        }

        if (!changed) {
            throw new RuntimeException("No changes detected.");
        }

        playerRepository.save(player);
    }

    // ── UPLOAD photo ──────────────────────────────────────────────────────────

    public String uploadPhoto(String playerId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) throw new RuntimeException("No file provided");

        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/")) throw new RuntimeException("Only image files are allowed");
        if (file.getSize() > 5 * 1024 * 1024)       throw new RuntimeException("Image must be smaller than 5 MB");

        Player player = findPlayer(playerId);
        String dataUrl = "data:" + ct + ";base64," + Base64.getEncoder().encodeToString(file.getBytes());
        player.setPhotoUrl(dataUrl);
        playerRepository.save(player);
        return dataUrl;
    }

    // ── DELETE photo ──────────────────────────────────────────────────────────

    public void deletePhoto(String playerId) {
        Player player = findPlayer(playerId);
        player.setPhotoUrl(null);
        playerRepository.save(player);
    }

    // ── GET photo URL ─────────────────────────────────────────────────────────

    public String getPhotoUrl(String playerId) {
        return findPlayer(playerId).getPhotoUrl();
    }

    // ── GET profile info (read-only fields) ───────────────────────────────────

    public java.util.Map<String, Object> getProfileInfo(String playerId) {
        Player player = findPlayer(playerId);
        java.util.Map<String, Object> info = new java.util.HashMap<>();
        info.put("gender",    player.getGender() != null ? player.getGender().name() : null);
        info.put("sportId",   player.getSportId());
        // Resolve sport name
        String sportName = null;
        if (player.getSportId() != null) {
            try { sportName = sportService.getById(player.getSportId()).getSportName(); }
            catch (Exception ignored) {}
        }
        info.put("sportName", sportName);
        return info;
    }

    // ── EXPLORE players (same sport, active, individual) ─────────────────────

    /**
     * Returns all active individual players sharing the given sportId,
     * excluding the requesting player themselves.
     * Each card is decorated with the current relationship status.
     */
    public List<PlayerExploreDto> explorePlayers(String sportId, String viewerId, String username) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.PLAYER
                          && u.getAccountStatus() == User.AccountStatus.ACTIVE)
                .map(u -> (Player) u)
                .filter(p -> sportId.equals(p.getSportId()))
                .filter(p -> !p.getUserId().equals(viewerId))          // exclude self
                .filter(p -> username == null || username.isBlank()
                          || (p.getFullName() != null
                              && p.getFullName().toLowerCase().contains(username.trim().toLowerCase())))
                .map(p -> {
                    FriendDto.RelationStatus rel = friendService.getRelationStatus(viewerId, p.getUserId());
                    String pendingId = rel == FriendDto.RelationStatus.REQUEST_SENT
                            ? friendService.getPendingRequestId(viewerId, p.getUserId())
                            : null;
                    return new PlayerExploreDto(
                            p.getPlayerId(),
                            p.getFullName(),
                            p.getPhotoUrl(),
                            p.getGender(),
                            rel,
                            pendingId);
                })
                .collect(Collectors.toList());
    }
}
