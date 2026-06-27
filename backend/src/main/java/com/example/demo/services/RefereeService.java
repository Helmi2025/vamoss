package com.example.demo.services;

import com.example.demo.dto.AuthDtos.RefereeProfileUpdateRequest;
import com.example.demo.entities.Referee;
import com.example.demo.entities.Tournament;
import com.example.demo.entities.TournamentMatch;
import com.example.demo.entities.User;
import com.example.demo.repositories.RefereeRepository;
import com.example.demo.repositories.TournamentMatchRepository;
import com.example.demo.repositories.TournamentRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.tournament.MatchStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefereeService {

    private final TournamentMatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final RefereeRepository refereeRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Get matches assigned to referee ──────────────────────────────────────

    public List<TournamentMatch> getRefereeMatches(String refereeId) {
        return matchRepository.findByRefereeId(refereeId);
    }

    // ── Get tournaments where referee has assigned matches ───────────────────

    public List<Tournament> getRefereeTournaments(String refereeId) {
        List<TournamentMatch> matches = matchRepository.findByRefereeId(refereeId);
        Set<String> tournamentIds = matches.stream()
                .map(TournamentMatch::getTournamentId)
                .collect(Collectors.toSet());

        return tournamentIds.stream()
                .map(id -> tournamentRepository.findById(id).orElse(null))
                .filter(t -> t != null)
                .collect(Collectors.toList());
    }

    // ── Update match result and statistics ───────────────────────────────────

    public TournamentMatch updateMatchResult(String refereeId, String matchId,
                                             Integer score1, Integer score2,
                                             Integer yellowCardsTeam1, Integer yellowCardsTeam2,
                                             Integer redCardsTeam1, Integer redCardsTeam2) {
        TournamentMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found: " + matchId));

        // Verify referee is assigned to this match
        if (!refereeId.equals(match.getRefereeId())) {
            throw new RuntimeException("You are not assigned to this match");
        }

        // Update scores
        match.setScore1(score1);
        match.setScore2(score2);

        // Update card statistics
        if (yellowCardsTeam1 != null) match.setYellowCardsTeam1(yellowCardsTeam1);
        if (yellowCardsTeam2 != null) match.setYellowCardsTeam2(yellowCardsTeam2);
        if (redCardsTeam1 != null) match.setRedCardsTeam1(redCardsTeam1);
        if (redCardsTeam2 != null) match.setRedCardsTeam2(redCardsTeam2);

        // Determine winner
        if (score1 != null && score2 != null) {
            if (score1 > score2) {
                match.setWinnerId(match.getParticipant1Id());
                match.setWinnerType(match.getParticipant1Type());
            } else if (score2 > score1) {
                match.setWinnerId(match.getParticipant2Id());
                match.setWinnerType(match.getParticipant2Type());
            }
            match.setStatus(MatchStatus.PLAYED);
        }

        return matchRepository.save(match);
    }

    // ── Reschedule match ─────────────────────────────────────────────────────

    public TournamentMatch rescheduleMatch(String refereeId, String matchId,
                                           LocalDateTime newScheduledDate, String newFieldId) {
        TournamentMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found: " + matchId));

        // Verify referee is assigned to this match
        if (!refereeId.equals(match.getRefereeId())) {
            throw new RuntimeException("You are not assigned to this match");
        }

        // Only allow rescheduling if match hasn't been played yet
        if (match.getStatus() == MatchStatus.PLAYED) {
            throw new RuntimeException("Cannot reschedule a completed match");
        }

        if (newScheduledDate != null) {
            match.setScheduledDate(newScheduledDate);
        }
        if (newFieldId != null) {
            match.setFieldId(newFieldId);
        }

        return matchRepository.save(match);
    }

    // ── Profile update ───────────────────────────────────────────────────────

    public void updateProfile(String userId, RefereeProfileUpdateRequest req) {
        Referee referee = findReferee(userId);

        if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
            throw new RuntimeException("Current password is required to save changes.");
        }

        if (!passwordEncoder.matches(req.getCurrentPassword(), referee.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        boolean changed = false;

        if (req.getNewFullName() != null && !req.getNewFullName().isBlank()) {
            referee.setFullName(req.getNewFullName().trim());
            changed = true;
        }

        if (req.getNewEmail() != null && !req.getNewEmail().isBlank()) {
            String newEmail = req.getNewEmail().trim();
            if (!newEmail.equals(referee.getEmail())) {
                if (refereeRepository.findByEmail(newEmail).isPresent()) {
                    throw new RuntimeException("Email already in use: " + newEmail);
                }
                referee.setEmail(newEmail);
                changed = true;
            }
        }

        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            referee.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
            changed = true;
        }

        if (!changed) {
            throw new RuntimeException("No changes detected");
        }

        refereeRepository.save(referee);
    }

    // ── Photo upload ─────────────────────────────────────────────────────────

    public String uploadPhoto(String userId, MultipartFile file) throws java.io.IOException {
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

        Referee referee = findReferee(userId);

        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
        String dataUrl = "data:" + contentType + ";base64," + base64;

        referee.setPhotoUrl(dataUrl);
        refereeRepository.save(referee);

        return dataUrl;
    }

    // ── Photo delete ──────────────────────────────────────────────────────────

    public void deletePhoto(String userId) {
        Referee referee = findReferee(userId);
        referee.setPhotoUrl(null);
        refereeRepository.save(referee);
    }

    // ── Get current photoUrl ──────────────────────────────────────────────────

    public String getPhotoUrl(String userId) {
        return findReferee(userId).getPhotoUrl();
    }

    // ── Helper methods ───────────────────────────────────────────────────────

    private Referee findReferee(String userId) {
        return refereeRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Referee not found: " + userId));
    }
}
