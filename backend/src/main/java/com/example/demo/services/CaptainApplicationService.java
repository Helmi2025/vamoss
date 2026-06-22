package com.example.demo.services;

import com.example.demo.dto.CaptainApplicationRequest;
import com.example.demo.dto.PendingCaptainDto;
import com.example.demo.entities.Captain;
import com.example.demo.entities.Sport;
import com.example.demo.entities.Team;
import com.example.demo.entities.User;
import com.example.demo.repositories.TeamRepository;
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
public class CaptainApplicationService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final SportService sportService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.base-url}")
    private String baseUrl;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd MMMM yyyy 'at' HH:mm");

    // ── Public: Apply as captain ────────────────────────────────────────────────

    public void apply(CaptainApplicationRequest req) {
        // Validate passwords match
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Email uniqueness
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Team name uniqueness
        if (teamRepository.existsByTeamName(req.getTeamName())) {
            throw new RuntimeException("Team name already taken");
        }

        // Verify sport exists
        Sport sport = sportService.getById(req.getSportId());

        // Create Captain user (status = PENDING_REVIEW)
        Captain captain = new Captain(
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getFullName(),
                null
        );
        Captain savedCaptain = (Captain) userRepository.save(captain);
        savedCaptain.setCaptainId(savedCaptain.getUserId());
        savedCaptain = (Captain) userRepository.save(savedCaptain);

        // Create Team document
        Team team = new Team(null, req.getTeamName(), req.getSportId(),
                savedCaptain.getUserId(), null, LocalDateTime.now());
        Team savedTeam = teamRepository.save(team);

        // Link team to captain
        savedCaptain.setTeamId(savedTeam.getId());
        userRepository.save(savedCaptain);

        // Send confirmation email
        emailService.sendApplicationReceived(
                savedCaptain.getEmail(),
                savedCaptain.getFullName(),
                req.getTeamName(),
                sport.getSportName(),
                savedCaptain.getAppliedAt().format(DATE_FMT)
        );
    }

    // ── Admin: List pending applications ───────────────────────────────────────

    public List<PendingCaptainDto> getPendingApplications() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.CAPTAIN
                        && u.getAccountStatus() == User.AccountStatus.PENDING_REVIEW)
                .map(u -> {
                    Captain c = (Captain) u;
                    Team team = teamRepository.findByCaptainId(c.getUserId()).orElse(null);
                    String teamName = team != null ? team.getTeamName() : "–";
                    String sportName = "–";
                    String sportId = null;
                    if (team != null && team.getSportId() != null) {
                        try {
                            Sport sport = sportService.getById(team.getSportId());
                            sportName = sport.getSportName();
                            sportId = sport.getId();
                        } catch (Exception ignored) {}
                    }
                    return new PendingCaptainDto(
                            c.getUserId(), c.getFullName(), c.getEmail(),
                            teamName, sportName, sportId, c.getAppliedAt(),
                            c.getAccountStatus()
                    );
                })
                .collect(Collectors.toList());
    }

    // ── Admin: Approve ──────────────────────────────────────────────────────────

    public void approve(String userId) {
        Captain captain = getCaptainById(userId);
        captain.setAccountStatus(User.AccountStatus.ACTIVE);
        userRepository.save(captain);

        Team team = teamRepository.findByCaptainId(userId).orElse(null);
        String teamName = team != null ? team.getTeamName() : "–";
        String sportName = getSportName(team);

        emailService.sendApplicationApproved(
                captain.getEmail(),
                captain.getFullName(),
                teamName,
                sportName,
                baseUrl + "/login"
        );
    }

    // ── Admin: Reject ───────────────────────────────────────────────────────────

    public void reject(String userId, String reason) {
        Captain captain = getCaptainById(userId);
        captain.setAccountStatus(User.AccountStatus.INACTIVE);
        userRepository.save(captain);

        Team team = teamRepository.findByCaptainId(userId).orElse(null);
        String teamName = team != null ? team.getTeamName() : "–";
        String sportName = getSportName(team);

        emailService.sendApplicationRejected(
                captain.getEmail(),
                captain.getFullName(),
                teamName,
                sportName,
                reason
        );
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private Captain getCaptainById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        if (!(user instanceof Captain)) {
            throw new RuntimeException("User is not a captain: " + userId);
        }
        return (Captain) user;
    }

    private String getSportName(Team team) {
        if (team == null || team.getSportId() == null) return "–";
        try {
            return sportService.getById(team.getSportId()).getSportName();
        } catch (Exception e) {
            return "–";
        }
    }
}
