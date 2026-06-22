package com.example.demo.repositories;

import com.example.demo.entities.TournamentMatch;
import com.example.demo.tournament.MatchRound;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TournamentMatchRepository extends MongoRepository<TournamentMatch, String> {
    List<TournamentMatch> findByTournamentId(String tournamentId);
    List<TournamentMatch> findByTournamentIdAndRound(String tournamentId, MatchRound round);

    /**
     * Returns true when another match (excluding matchId) on the same field
     * has a scheduledDate that falls within [windowStart, windowEnd).
     * Used to detect 2-hour booking window conflicts.
     */
    boolean existsByFieldIdAndScheduledDateBetweenAndIdNot(
            String fieldId,
            LocalDateTime windowStart,
            LocalDateTime windowEnd,
            String id);

    /**
     * Returns all matches scheduled on a given field (past and future).
     * Only matches that have been assigned a date are returned.
     */
    List<TournamentMatch> findByFieldIdAndScheduledDateNotNullOrderByScheduledDateAsc(String fieldId);

    /**
     * Returns scheduled matches for a tournament whose scheduledDate falls
     * within [from, to] (inclusive). Used to validate tournament date edits.
     */
    List<TournamentMatch> findByTournamentIdAndScheduledDateBetween(
            String tournamentId,
            LocalDateTime from,
            LocalDateTime to);

    /**
     * Returns all matches whose scheduledDate falls within [from, to].
     * Used to fetch today's matches across all tournaments.
     */
    List<TournamentMatch> findByScheduledDateBetween(LocalDateTime from, LocalDateTime to);

    /**
     * Returns all matches scheduled strictly after the given datetime, sorted by date asc.
     * Used to fetch upcoming (future) matches.
     */
    List<TournamentMatch> findByScheduledDateAfterOrderByScheduledDateAsc(LocalDateTime after);

    /**
     * Returns all matches scheduled strictly before the given datetime, sorted by date desc.
     * Used to fetch past (history) matches.
     */
    List<TournamentMatch> findByScheduledDateBeforeOrderByScheduledDateDesc(LocalDateTime before);
}
