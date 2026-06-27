package com.example.demo.services;

import com.example.demo.dto.AuthDtos.AuthResponse;
import com.example.demo.dto.AuthDtos.LoginRequest;
import com.example.demo.dto.AuthDtos.RegisterRequest;
import com.example.demo.entities.Admin;
import com.example.demo.entities.Captain;
import com.example.demo.entities.Player;
import com.example.demo.entities.Referee;
import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ── Register ────────────────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use: " + request.getEmail());
        }

        User user = buildUser(request);
        User saved = userRepository.save(user);

        // Sync the specific ID field (adminId / captainId / playerId)
        syncSpecificId(saved);
        userRepository.save(saved);

        String token = generateTokenForUser(saved);
        if (saved instanceof Player player) {
            return new AuthResponse(token, saved.getUserId(), saved.getEmail(), saved.getFullName(),
                    saved.getRole(), player.getTeamId(), player.getSportId());
        }
        return new AuthResponse(token, saved.getUserId(), saved.getEmail(), saved.getFullName(), saved.getRole());
    }

    // ── Login ───────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Account status gate — checked AFTER password is verified
        switch (user.getAccountStatus()) {
            case PENDING_REVIEW -> throw new RuntimeException(
                    "Your application is still under review. " +
                    "We will notify you by email once a decision has been made.");
            case INACTIVE -> throw new RuntimeException(
                    "Unfortunately, your account does not have access to the platform. " +
                    "Please contact us at vamossportsfax@gmail.com for more information.");
            case ACTIVE -> { /* proceed */ }
        }

        String token = generateTokenForUser(user);
        if (user instanceof Player player) {
            return new AuthResponse(token, user.getUserId(), user.getEmail(), user.getFullName(),
                    user.getRole(), player.getTeamId(), player.getSportId());
        }
        return new AuthResponse(token, user.getUserId(), user.getEmail(), user.getFullName(), user.getRole());
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private User buildUser(RegisterRequest req) {
        String hashed = passwordEncoder.encode(req.getPassword());
        return switch (req.getRole()) {
            case ADMIN   -> new Admin(req.getEmail(), hashed, req.getFullName(), req.getPhoneNumber());
            case CAPTAIN -> new Captain(req.getEmail(), hashed, req.getFullName(), req.getPhoneNumber());
            case PLAYER  -> new Player(req.getEmail(), hashed, req.getFullName(), req.getPhoneNumber());
            case REFEREE -> new Referee(req.getEmail(), hashed, req.getFullName(), req.getPhoneNumber());
        };
    }

    private void syncSpecificId(User user) {
        switch (user.getRole()) {
            case ADMIN   -> ((Admin) user).setAdminId(user.getUserId());
            case CAPTAIN -> ((Captain) user).setCaptainId(user.getUserId());
            case PLAYER  -> ((Player) user).setPlayerId(user.getUserId());
            case REFEREE -> ((Referee) user).setRefereeId(user.getUserId());
        }
    }

    private String generateTokenForUser(User user) {
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();

        return jwtService.generateToken(userDetails, user.getUserId(), user.getRole().name());
    }
}
