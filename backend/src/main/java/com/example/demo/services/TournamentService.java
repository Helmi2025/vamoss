package com.example.demo.services;

import com.example.demo.dto.*;

import java.util.List;

public interface TournamentService {
    TournamentResponse create(TournamentCreateRequest request);
    List<TournamentResponse> getAll();
    TournamentResponse getById(String id);
    TournamentResponse update(String id, TournamentUpdateRequest request);
    void cancel(String id);
    void delete(String id);
    TournamentParticipantResponse registerTeam(String tournamentId, RegisterTeamRequest request);
    void unregisterTeam(String tournamentId, String captainId);
    TournamentParticipantResponse registerPlayer(String tournamentId, RegisterPlayerRequest request);
    DoublesTeamResponse registerDoubles(String tournamentId, RegisterDoublesRequest request);
    void unregisterPlayer(String tournamentId, String playerId);
    void removeParticipant(String tournamentId, String participantId);
    List<TournamentParticipantResponse> getParticipants(String tournamentId);
    List<BracketResponse.ParticipantSummary> getParticipantDetails(String tournamentId);
    List<EligibleFriendDto> getEligiblePartners(String tournamentId, String playerId);
    DoublesTeamResponse getMyDoublesTeam(String tournamentId, String playerId);
}
