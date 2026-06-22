package com.example.demo.dto;

import com.example.demo.tournament.GenderCategory;
import com.example.demo.tournament.TournamentFormat;
import com.example.demo.tournament.ValidParticipantLimit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentCreateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Sport ID is required")
    private String sportId;

    @ValidParticipantLimit
    private int participantLimit;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    /**
     * Required for individual-sport tournaments (Tennis / Padel).
     * Must be SINGLES or DOUBLES.  Ignored (and may be null) for team-based sports.
     */
    private TournamentFormat format;

    /**
     * Required for individual-sport tournaments (Tennis / Padel).
     * Must be MEN, WOMEN, or OPEN.  Ignored (and may be null) for team-based sports.
     */
    private GenderCategory genderCategory;
}
