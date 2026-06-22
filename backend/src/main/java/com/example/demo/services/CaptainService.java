package com.example.demo.services;

import com.example.demo.dto.AuthDtos.CaptainProfileUpdateRequest;
import com.example.demo.entities.Captain;
import com.example.demo.repositories.CaptainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class CaptainService {

    private final CaptainRepository captainRepository;
    private final PasswordEncoder passwordEncoder;

    // ── helpers ──────────────────────────────────────────────────────────────

    private Captain findCaptain(String userId) {
        // findById via CaptainRepository returns a Captain directly
        Captain captain = captainRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Captain not found"));

        // Re-fetch by email to ensure passwordHash is correctly deserialized
        return captainRepository.findByEmail(captain.getEmail())
                .orElseThrow(() -> new RuntimeException("Captain not found"));
    }

    // ── profile update (name / email / password) ─────────────────────────────

    public void updateProfile(String userId, CaptainProfileUpdateRequest req) {
        Captain captain = findCaptain(userId);

        if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
            throw new RuntimeException("Current password is required to save changes.");
        }

        if (!passwordEncoder.matches(req.getCurrentPassword(), captain.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        boolean changed = false;

        if (req.getNewFullName() != null && !req.getNewFullName().isBlank()) {
            captain.setFullName(req.getNewFullName().trim());
            changed = true;
        }

        if (req.getNewEmail() != null && !req.getNewEmail().isBlank()) {
            String newEmail = req.getNewEmail().trim();
            if (!newEmail.equals(captain.getEmail())) {
                if (captainRepository.findByEmail(newEmail).isPresent()) {
                    throw new RuntimeException("Email already in use: " + newEmail);
                }
                captain.setEmail(newEmail);
                changed = true;
            }
        }

        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            captain.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
            changed = true;
        }

        if (!changed) {
            throw new RuntimeException("No changes detected");
        }

        captainRepository.save(captain);
    }

    // ── photo upload ─────────────────────────────────────────────────────────

    public String uploadPhoto(String userId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file provided");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("Image must be smaller than 5 MB");
        }

        Captain captain = findCaptain(userId);

        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
        String dataUrl = "data:" + contentType + ";base64," + base64;

        captain.setPhotoUrl(dataUrl);
        captainRepository.save(captain);

        return dataUrl;
    }

    // ── photo delete ──────────────────────────────────────────────────────────

    public void deletePhoto(String userId) {
        Captain captain = findCaptain(userId);
        captain.setPhotoUrl(null);
        captainRepository.save(captain);
    }

    // ── get current photoUrl ──────────────────────────────────────────────────

    public String getPhotoUrl(String userId) {
        return findCaptain(userId).getPhotoUrl();
    }
}
