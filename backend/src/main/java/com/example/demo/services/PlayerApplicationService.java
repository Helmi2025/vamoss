package com.example.demo.services;

import com.example.demo.dto.PlayerApplicationRequest;
import com.example.demo.dto.PendingPlayerDto;
import com.example.demo.entities.Player;
import com.example.demo.entities.Sport;
import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayerApplicationService {

    private final UserRepository userRepository;
    private final SportService sportService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.base-url}")
    private String baseUrl;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd MMMM yyyy 'at' HH:mm");

    // ── Public: Apply as player ────────────────────────────────────────────────

    public void apply(PlayerApplicationRequest req) {
        // Validate passwords match
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Email uniqueness
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Verify sport exists and is an individual sport (Tennis or Padel, not Football/Basketball)
        Sport sport = sportService.getById(req.getSportId());
        if (sportService.isTeamSportName(sport.getSportName())) {
            throw new RuntimeException("This sport requires a team/captain registration");
        }

        // Create Player user (status = PENDING_REVIEW)
        Player player = new Player(
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getUsername(),
                null,
                User.AccountStatus.PENDING_REVIEW
        );
        player.setSportId(req.getSportId());
        player.setAppliedAt(LocalDateTime.now());
        player.setGender(req.getGender());
        
        Player savedPlayer = (Player) userRepository.save(player);
        savedPlayer.setPlayerId(savedPlayer.getUserId());
        userRepository.save(savedPlayer);

        // Send confirmation email
        emailService.sendPlayerApplicationReceived(
                savedPlayer.getEmail(),
                savedPlayer.getFullName(),
                sport.getSportName(),
                savedPlayer.getAppliedAt().format(DATE_FMT)
        );
    }

    // ── Admin: List pending applications ───────────────────────────────────────

    public List<PendingPlayerDto> getPendingApplications() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.PLAYER
                        && u.getAccountStatus() == User.AccountStatus.PENDING_REVIEW)
                .map(u -> {
                    Player p = (Player) u;
                    String sportName = "–";
                    String sportId = null;
                    if (p.getSportId() != null) {
                        try {
                            Sport sport = sportService.getById(p.getSportId());
                            sportName = sport.getSportName();
                            sportId = sport.getId();
                        } catch (Exception ignored) {}
                    }
                    return new PendingPlayerDto(
                            p.getUserId(), p.getFullName(), p.getEmail(),
                            sportName, sportId, p.getAppliedAt(),
                            p.getAccountStatus(), p.getGender()
                    );
                })
                .collect(Collectors.toList());
    }

    // ── Admin: Approve ──────────────────────────────────────────────────────────

    public void approve(String userId) {
        Player player = getPlayerById(userId);
        player.setAccountStatus(User.AccountStatus.ACTIVE);
        userRepository.save(player);

        String sportName = getSportName(player);

        emailService.sendPlayerApplicationApproved(
                player.getEmail(),
                player.getFullName(),
                sportName,
                baseUrl + "/login"
        );
    }

    // ── Admin: Reject ───────────────────────────────────────────────────────────

    public void reject(String userId, String reason) {
        Player player = getPlayerById(userId);
        player.setAccountStatus(User.AccountStatus.INACTIVE);
        userRepository.save(player);

        String sportName = getSportName(player);

        emailService.sendPlayerApplicationRejected(
                player.getEmail(),
                player.getFullName(),
                sportName,
                reason != null ? reason : "Unfortunately, your application did not meet our requirements at this time."
        );
    }

    // ── Private helpers ─────────────────────────────────────────────────────────

    private Player getPlayerById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Player not found"));
        if (user.getRole() != User.Role.PLAYER) {
            throw new RuntimeException("User is not a player");
        }
        return (Player) user;
    }

    private String getSportName(Player player) {
        if (player.getSportId() != null) {
            try {
                Sport sport = sportService.getById(player.getSportId());
                return sport.getSportName();
            } catch (Exception ignored) {}
        }
        return "–";
    }
}
