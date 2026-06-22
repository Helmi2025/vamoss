package com.example.demo.tournament;

/**
 * Distinguishes singles (1 vs 1) from doubles (2 vs 2) in individual-sport
 * tournaments (Tennis, Padel).  Only applicable when the sport is NOT team-enabled.
 */
public enum TournamentFormat {
    SINGLES,
    DOUBLES
}
