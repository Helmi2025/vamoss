package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * A single 2-hour booking slot on a field, derived from a scheduled match.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FieldReservationDto {
    /** The match that created this reservation */
    private String matchId;

    /** Human-readable label, e.g. "Round of 16 – Match 3" */
    private String label;

    /** Tournament name */
    private String tournamentName;

    /** Booking window start — equals the match's scheduledDate */
    private LocalDateTime start;

    /** Booking window end — always start + 2 hours */
    private LocalDateTime end;

    /** Whether this slot is currently active (now is between start and end) */
    private boolean currentlyActive;
}
