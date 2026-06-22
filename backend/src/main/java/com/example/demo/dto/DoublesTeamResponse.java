package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for doubles-team registration and listing.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoublesTeamResponse {
    private String id;
    private String tournamentId;
    private String player1Id;
    private String player1Name;
    private String player2Id;
    private String player2Name;
    private String teamName;
}
