package com.example.demo.services;

import com.example.demo.entities.Referee;
import com.example.demo.entities.User;
import com.example.demo.repositories.RefereeRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminRefereeService {

    private final UserRepository userRepository;
    private final RefereeRepository refereeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SportService sportService;

    @Value("${app.base-url}")
    private String baseUrl;

    // ── List all active referees (optionally filtered by sportId) ─────────────

    public List<RefereeSummary> getAllReferees(String sportId) {
        List<Referee> referees = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.REFEREE
                          && u.getAccountStatus() == User.AccountStatus.ACTIVE)
                .map(u -> (Referee) u)
                .collect(Collectors.toList());

        // Optional sport filter
        if (sportId != null && !sportId.isBlank()) {
            referees = referees.stream()
                    .filter(r -> sportId.equals(r.getSportId()))
                    .collect(Collectors.toList());
        }

        return referees.stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    // ── Create a new referee ─────────────────────────────────────────────────

    public RefereeSummary createReferee(String fullName, String email, String phoneNumber, String sportId) {
        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use: " + email);
        }

        // Generate random password
        String plainPassword = generateRandomPassword();
        String encodedPassword = passwordEncoder.encode(plainPassword);

        Referee referee = new Referee(email, encodedPassword, fullName, phoneNumber);
        referee.setSportId(sportId);
        referee.setAccountStatus(User.AccountStatus.ACTIVE);
        referee = refereeRepository.save(referee);

        // Send email with credentials
        String loginUrl = baseUrl + "/login";
        emailService.sendRefereeCreated(email, fullName, plainPassword, loginUrl);

        return toSummary(referee);
    }

    // ── Update referee information ───────────────────────────────────────────

    public RefereeSummary updateReferee(String refereeId, String fullName, String phoneNumber, String sportId) {
        Referee referee = refereeRepository.findById(refereeId)
                .orElseThrow(() -> new RuntimeException("Referee not found: " + refereeId));

        if (fullName != null) {
            referee.setFullName(fullName);
        }
        if (phoneNumber != null) {
            referee.setPhoneNumber(phoneNumber);
        }
        if (sportId != null) {
            referee.setSportId(sportId);
        }

        referee = refereeRepository.save(referee);
        return toSummary(referee);
    }

    // ── Delete referee ───────────────────────────────────────────────────────

    public void deleteReferee(String refereeId) {
        if (!refereeRepository.existsById(refereeId)) {
            throw new RuntimeException("Referee not found: " + refereeId);
        }
        refereeRepository.deleteById(refereeId);
    }

    // ── Helper methods ───────────────────────────────────────────────────────

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
        StringBuilder password = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }

    private RefereeSummary toSummary(Referee referee) {
        String sportName = "–";
        if (referee.getSportId() != null) {
            try {
                sportName = sportService.getById(referee.getSportId()).getSportName();
            } catch (Exception e) {
                sportName = "–";
            }
        }

        return new RefereeSummary(
                referee.getUserId(),
                referee.getFullName(),
                referee.getEmail(),
                referee.getPhoneNumber(),
                referee.getSportId(),
                sportName,
                referee.getPhotoUrl(),
                referee.getRegisteredAt()
        );
    }

    // ── DTO ──────────────────────────────────────────────────────────────────

    public record RefereeSummary(
            String refereeId,
            String fullName,
            String email,
            String phoneNumber,
            String sportId,
            String sportName,
            String photoUrl,
            java.time.LocalDateTime registeredAt
    ) {}
}
