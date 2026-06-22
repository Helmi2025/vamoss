package com.example.demo.services;

import com.example.demo.dto.MatchResponse;
import com.example.demo.dto.MatchResultRequest;
import com.example.demo.dto.MatchScheduleRequest;
import com.example.demo.dto.TodayMatchDto;

import java.util.List;

public interface MatchService {
    MatchResponse recordResult(String matchId, MatchResultRequest request);
    MatchResponse scheduleMatch(String matchId, MatchScheduleRequest request);
    MatchResponse getById(String matchId);
    List<MatchResponse> getByTournamentId(String tournamentId);
    List<TodayMatchDto> getTodayMatches();
    List<TodayMatchDto> getFutureMatches();
    List<TodayMatchDto> getPastMatches();
}
