package com.example.demo.entities;

import com.example.demo.tournament.GenderCategory;
import com.example.demo.tournament.ParticipantType;
import com.example.demo.tournament.TournamentFormat;
import com.example.demo.tournament.TournamentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tournaments")
@CompoundIndexes({
    @CompoundIndex(def = "{'sportId': 1}"),
    @CompoundIndex(def = "{'status': 1}")
})
public class Tournament {

    @Id
    private String id;

    private String name;

    private String sportId;

    private int participantLimit;

    private int currentParticipants = 0;

    private TournamentStatus status = TournamentStatus.REGISTRATION_OPEN;

    private String championId;

    private ParticipantType championType;

    private boolean registrationOpen = true;

    /**
     * Only set for individual-sport (Tennis / Padel) tournaments.
     * Null for team-based sports.
     */
    private TournamentFormat format;

    /**
     * Gender restriction for individual-sport tournaments.
     * Null for team-based sports.
     */
    private GenderCategory genderCategory;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
