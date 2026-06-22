package com.example.demo.services;

import com.example.demo.dto.TeamManagementDtos.*;
import com.example.demo.entities.Captain;
import com.example.demo.entities.Player;
import com.example.demo.entities.Team;
import com.example.demo.entities.User;
import com.example.demo.repositories.CaptainRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.TeamRepository;
import com.example.demo.repositories.UserRepository;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamManagementService {

    private final CaptainRepository captainRepository;
    private final TeamRepository    teamRepository;
    private final PlayerRepository  playerRepository;
    private final UserRepository    userRepository;
    private final SportService      sportService;
    private final EmailService      emailService;
    private final PasswordEncoder   passwordEncoder;
    private final GridFsTemplate    gridFsTemplate;
    private final GridFsOperations  gridFsOperations;

    @Value("${app.base-url}")
    private String baseUrl;

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Captain getCaptain(String captainId) {
        return captainRepository.findById(captainId)
                .orElseThrow(() -> new RuntimeException("Captain not found"));
    }

    private Team getTeamByCaptain(String captainId) {
        return teamRepository.findByCaptainId(captainId)
                .orElseThrow(() -> new RuntimeException("Team not found for captain"));
    }

    private String buildLogoUrl(String logoFileId) {
        return logoFileId != null
                ? baseUrl + "/api/captain/team/logo/" + logoFileId
                : null;
    }

    // ── GET team info ─────────────────────────────────────────────────────────

    public TeamInfoDto getTeamInfo(String captainId) {
        Team team = getTeamByCaptain(captainId);

        String sportName = "–";
        if (team.getSportId() != null) {
            try { sportName = sportService.getById(team.getSportId()).getSportName(); }
            catch (Exception ignored) {}
        }

        return new TeamInfoDto(
                team.getId(),
                team.getTeamName(),
                sportName,
                team.getSportId(),
                buildLogoUrl(team.getLogoFileId())
        );
    }

    // ── RENAME team ───────────────────────────────────────────────────────────

    public TeamInfoDto renameTeam(String captainId, String newName) {
        Team team = getTeamByCaptain(captainId);

        String trimmed = newName.trim();
        if (trimmed.equals(team.getTeamName())) {
            throw new RuntimeException("New team name is the same as the current name");
        }
        if (teamRepository.existsByTeamName(trimmed)) {
            throw new RuntimeException("Team name already taken: " + trimmed);
        }

        team.setTeamName(trimmed);
        teamRepository.save(team);

        return getTeamInfo(captainId);
    }

    // ── UPLOAD team logo (GridFS) ─────────────────────────────────────────────

    public TeamInfoDto uploadLogo(String captainId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file provided");
        }
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("Logo must be smaller than 5 MB");
        }

        Team team = getTeamByCaptain(captainId);

        // Remove old logo from GridFS if present
        if (team.getLogoFileId() != null) {
            try {
                gridFsTemplate.delete(
                        new Query(Criteria.where("_id").is(new ObjectId(team.getLogoFileId()))));
            } catch (Exception ignored) {}
        }

        // Store new logo
        ObjectId fileId = gridFsTemplate.store(
                file.getInputStream(),
                file.getOriginalFilename(),
                ct
        );
        team.setLogoFileId(fileId.toString());
        teamRepository.save(team);

        return getTeamInfo(captainId);
    }

    // ── DELETE team logo ──────────────────────────────────────────────────────

    public TeamInfoDto deleteLogo(String captainId) {
        Team team = getTeamByCaptain(captainId);
        if (team.getLogoFileId() != null) {
            try {
                gridFsTemplate.delete(
                        new Query(Criteria.where("_id").is(new ObjectId(team.getLogoFileId()))));
            } catch (Exception ignored) {}
            team.setLogoFileId(null);
            teamRepository.save(team);
        }
        return getTeamInfo(captainId);
    }

    // ── STREAM team logo bytes from GridFS ────────────────────────────────────

    public static class LogoResource {
        private final byte[] data;
        private final String contentType;
        public LogoResource(byte[] data, String contentType) { this.data = data; this.contentType = contentType; }
        public byte[] getData()        { return data; }
        public String getContentType() { return contentType; }
    }

    public LogoResource getLogo(String fileId) throws IOException {
        GridFSFile file = gridFsTemplate.findOne(
                new Query(Criteria.where("_id").is(new ObjectId(fileId))));
        if (file == null) throw new RuntimeException("Logo not found: " + fileId);

        String contentType = "image/png";
        if (file.getMetadata() != null) {
            Object ct = file.getMetadata().get("_contentType");
            if (ct instanceof String s && !s.isBlank()) contentType = s;
        }

        InputStream is = gridFsOperations.getResource(file).getInputStream();
        byte[] data = is.readAllBytes();
        is.close();
        return new LogoResource(data, contentType);
    }

    // ── LIST players ──────────────────────────────────────────────────────────

    public List<PlayerDto> getPlayers(String captainId) {
        Team team = getTeamByCaptain(captainId);
        return playerRepository.findByTeamId(team.getId()).stream()
                .filter(p -> p.getRole() == User.Role.PLAYER)
                .map(p -> new PlayerDto(
                        p.getPlayerId(),
                        p.getFullName(),
                        p.getEmail(),
                        p.getPhotoUrl()))
                .collect(Collectors.toList());
    }

    // ── UPLOAD player photo (captain-side) ────────────────────────────────────

    public String uploadPlayerPhoto(String captainId, String playerId, MultipartFile file) {
        Team team = getTeamByCaptain(captainId);
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));
        if (!team.getId().equals(player.getTeamId())) {
            throw new RuntimeException("Player does not belong to your team");
        }
        if (file == null || file.isEmpty()) throw new RuntimeException("No file provided");
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/")) throw new RuntimeException("Only image files are allowed");
        if (file.getSize() > 5 * 1024 * 1024) throw new RuntimeException("Image must be smaller than 5 MB");

        try {
            byte[] bytes = file.getBytes();
            String dataUrl = "data:" + ct + ";base64," + java.util.Base64.getEncoder().encodeToString(bytes);
            player.setPhotoUrl(dataUrl);
            playerRepository.save(player);
            return dataUrl;
        } catch (Exception e) {
            throw new RuntimeException("Failed to process image: " + e.getMessage());
        }
    }

    // ── DELETE player photo (captain-side) ────────────────────────────────────

    public void deletePlayerPhoto(String captainId, String playerId) {
        Team team = getTeamByCaptain(captainId);
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));
        if (!team.getId().equals(player.getTeamId())) {
            throw new RuntimeException("Player does not belong to your team");
        }
        player.setPhotoUrl(null);
        playerRepository.save(player);
    }

    // ── UPDATE player (captain-side) ──────────────────────────────────────────

    public PlayerDto updatePlayer(String captainId, String playerId, UpdatePlayerRequest req) {
        Team team = getTeamByCaptain(captainId);

        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        // Ensure the player belongs to this captain's team
        if (!team.getId().equals(player.getTeamId())) {
            throw new RuntimeException("Player does not belong to your team");
        }

        if (req.getNewFullName() != null && !req.getNewFullName().isBlank()) {
            player.setFullName(req.getNewFullName().trim());
        }
        if (req.getNewEmail() != null && !req.getNewEmail().isBlank()) {
            String newEmail = req.getNewEmail().trim();
            if (!newEmail.equals(player.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new RuntimeException("Email already in use: " + newEmail);
            }
            player.setEmail(newEmail);
        }

        playerRepository.save(player);

        return new PlayerDto(
                player.getPlayerId(),
                player.getFullName(),
                player.getEmail(),
                player.getPhotoUrl()
        );
    }

    // ── ADD player ────────────────────────────────────────────────────────────

    public PlayerDto addPlayer(String captainId, AddPlayerRequest req) {
        // Email uniqueness check
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already in use: " + req.getEmail());
        }

        Captain captain = getCaptain(captainId);
        Team    team    = getTeamByCaptain(captainId);

        String sportName = "–";
        if (team.getSportId() != null) {
            try { sportName = sportService.getById(team.getSportId()).getSportName(); }
            catch (Exception ignored) {}
        }

        // Create Player user (immediately ACTIVE)
        Player player = new Player(
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getFullName(),
                null
        );
        player.setTeamId(team.getId());
        player.setCaptainId(captainId);

        Player saved = playerRepository.save(player);
        saved.setPlayerId(saved.getUserId());
        saved = playerRepository.save(saved);

        // Send welcome email with credentials
        emailService.sendPlayerAdded(
                saved.getEmail(),
                saved.getFullName(),
                team.getTeamName(),
                captain.getFullName(),
                sportName,
                req.getPassword(),          // plain-text password (one-time, for activation email)
                baseUrl + "/login"
        );

        return new PlayerDto(
                saved.getPlayerId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getPhotoUrl()
        );
    }
}
