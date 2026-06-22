package com.example.demo.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Represents a doubles pair registered for a specific tournament.
 * Each pair exists only within the scope of one tournament — a player
 * cannot join the same tournament twice (with the same or a different partner).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doubles_teams")
@CompoundIndexes({
    @CompoundIndex(def = "{'tournamentId': 1}"),
    @CompoundIndex(def = "{'tournamentId': 1, 'player1Id': 1}", unique = true),
    @CompoundIndex(def = "{'tournamentId': 1, 'player2Id': 1}", unique = true)
})
public class DoublesTeam {

    @Id
    private String id;

    private String tournamentId;

    /** The player who initiated the registration. */
    private String player1Id;

    /** The partner chosen from the initiator's friend list. */
    private String player2Id;

    /** Display name built from both players' names, e.g. "Alice & Bob". */
    private String teamName;

    private LocalDateTime registeredAt;
}
