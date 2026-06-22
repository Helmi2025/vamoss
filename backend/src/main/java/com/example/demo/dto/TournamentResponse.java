package com.example.demo.dto;

import com.example.demo.tournament.GenderCategory;
import com.example.demo.tournament.ParticipantType;
import com.example.demo.tournament.TournamentFormat;
import com.example.demo.tournament.TournamentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentResponse {
    private String id;
    private String name;
    private String sportId;
    private int participantLimit;
    private int currentParticipants;
    private TournamentStatus status;
    private String championId;
    private ParticipantType championType;
    private boolean registrationOpen;
    private TournamentFormat format;
    private GenderCategory genderCategory;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
