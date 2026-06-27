package com.example.demo.services;

import com.example.demo.dto.BracketResponse;
import com.example.demo.dto.BracketSwapRequest;
import com.example.demo.entities.Tournament;
import com.example.demo.entities.TournamentMatch;

public interface BracketService {
    void generateBracket(String tournamentId);
    BracketResponse getBracket(String tournamentId);
    void advanceWinner(TournamentMatch playedMatch, Tournament tournament);
    void swapParticipants(String tournamentId, BracketSwapRequest request);
}
