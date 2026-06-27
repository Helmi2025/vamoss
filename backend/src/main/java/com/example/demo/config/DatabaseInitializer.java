package com.example.demo.config;

import com.example.demo.entities.Sport;
import com.example.demo.entities.User;
import com.example.demo.repositories.SportRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Initializes the database with default values on application startup.
 * Sets the teamEnabled flag for existing sports based on sport name.
 * Fixes any users with null userId fields.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final SportRepository sportRepository;
    private final UserRepository userRepository;

    // Team sports that support captain/team functionality
    private static final List<String> TEAM_SPORTS = Arrays.asList("Football", "Basketball");

    @Override
    public void run(String... args) {
        log.info("Starting database initialization...");
        
        // Update existing sports with teamEnabled flag
        List<Sport> allSports = sportRepository.findAll();
        boolean updated = false;
        
        for (Sport sport : allSports) {
            boolean shouldBeTeamEnabled = TEAM_SPORTS.contains(sport.getSportName());
            
            // Only update if the value is different
            if (sport.isTeamEnabled() != shouldBeTeamEnabled) {
                sport.setTeamEnabled(shouldBeTeamEnabled);
                sportRepository.save(sport);
                log.info("Updated sport '{}' - teamEnabled set to {}", 
                    sport.getSportName(), shouldBeTeamEnabled);
                updated = true;
            }
        }
        
        if (updated) {
            log.info("Database initialization completed - sports updated.");
        } else {
            log.info("Database initialization completed - no updates needed.");
        }
        
        // Fix any users with null userId (should not happen, but defensive measure)
        fixUserIds();
    }
    
    private void fixUserIds() {
        log.info("Validating user userIds...");
        List<User> allUsers = userRepository.findAll();
        int invalidCount = 0;
        
        for (User user : allUsers) {
            if (user.getUserId() == null || user.getUserId().isBlank()) {
                log.error("CRITICAL: User with email {} ({}) has null/blank userId! This will cause chat failures.", 
                    user.getEmail(), user.getRole());
                invalidCount++;
            }
        }
        
        if (invalidCount > 0) {
            log.error("Found {} users with invalid userIds. Please check the database!", invalidCount);
        } else {
            log.info("All {} users have valid userIds", allUsers.size());
        }
    }
}
