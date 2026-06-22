package com.example.demo.services;

import com.example.demo.dto.AuthDtos.UpdateProfileRequest;
import com.example.demo.dto.PendingCaptainDto;
import com.example.demo.dto.PendingPlayerDto;
import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CaptainApplicationService captainApplicationService;
    private final PlayerApplicationService playerApplicationService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<PendingCaptainDto> getPendingCaptains() {
        return captainApplicationService.getPendingApplications();
    }

    public void approveCaptain(String userId) {
        captainApplicationService.approve(userId);
    }

    public void rejectCaptain(String userId, String reason) {
        captainApplicationService.reject(userId, reason);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PLAYER APPLICATION METHODS
    // ══════════════════════════════════════════════════════════════════════════

    public List<PendingPlayerDto> getPendingPlayers() {
        return playerApplicationService.getPendingApplications();
    }

    public void approvePlayer(String userId) {
        playerApplicationService.approve(userId);
    }

    public void rejectPlayer(String userId, String reason) {
        playerApplicationService.reject(userId, reason);
    }

    /**
     * Updates the admin's own profile.
     * currentPassword is always required to authorise any change.
     */
    public void updateProfile(String userId, UpdateProfileRequest req) {
        // Look up by userId via findById, but use the email field to re-fetch
        // via findByEmail to avoid polymorphic deserialization issues with passwordHash
        User userById = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Re-fetch by email to ensure correct deserialization of passwordHash
        User user = userRepository.findByEmail(userById.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        boolean changed = false;

        if (req.getNewFullName() != null && !req.getNewFullName().isBlank()) {
            user.setFullName(req.getNewFullName().trim());
            changed = true;
        }

        if (req.getNewEmail() != null && !req.getNewEmail().isBlank()) {
            String newEmail = req.getNewEmail().trim();
            if (!newEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new RuntimeException("Email already in use: " + newEmail);
                }
                user.setEmail(newEmail);
                changed = true;
            }
        }

        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
            changed = true;
        }

        if (!changed) {
            throw new RuntimeException("No changes detected");
        }

        userRepository.save(user);
    }
}
