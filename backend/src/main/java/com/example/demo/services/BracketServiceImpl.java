package com.example.demo.services;

import com.example.demo.dto.BracketResponse;
import com.example.demo.entities.*;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.*;
import com.example.demo.tournament.MatchRound;
import com.example.demo.tournament.MatchStatus;
import com.example.demo.tournament.ParticipantType;
import com.example.demo.tournament.TournamentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BracketServiceImpl implements BracketService {

    private final TournamentRepository tournamentRepository;
    private final TournamentParticipantRepository tournamentParticipantRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final DoublesTeamRepository doublesTeamRepository;
    private final SportRepository sportRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    public void generateBracket(String tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        List<TournamentParticipant> participants = tournamentParticipantRepository.findByTournamentId(tournamentId);

        Sport sport = sportRepository.findById(tournament.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));
        ParticipantType pType = sport.isTeamEnabled() ? ParticipantType.TEAM : ParticipantType.PLAYER;

        if (tournament.getParticipantLimit() == 4) {
            // Save final first
            TournamentMatch finalMatch = new TournamentMatch();
            finalMatch.setTournamentId(tournamentId);
            finalMatch.setRound(MatchRound.FINAL);
            finalMatch.setMatchNumber(3);
            finalMatch.setStatus(MatchStatus.PENDING);
            finalMatch.setCreatedAt(LocalDateTime.now());
            finalMatch = tournamentMatchRepository.save(finalMatch);

            // Save SF1
            TournamentMatch sf1 = new TournamentMatch();
            sf1.setTournamentId(tournamentId);
            sf1.setRound(MatchRound.SEMI_FINAL);
            sf1.setMatchNumber(1);
            sf1.setParticipant1Id(participants.get(0).getParticipantId());
            sf1.setParticipant1Type(participants.get(0).getParticipantType());
            sf1.setParticipant2Id(participants.get(1).getParticipantId());
            sf1.setParticipant2Type(participants.get(1).getParticipantType());
            sf1.setStatus(MatchStatus.PENDING);
            sf1.setNextMatchId(finalMatch.getId());
            sf1.setNextMatchPosition(1);
            sf1.setCreatedAt(LocalDateTime.now());
            tournamentMatchRepository.save(sf1);

            // Save SF2
            TournamentMatch sf2 = new TournamentMatch();
            sf2.setTournamentId(tournamentId);
            sf2.setRound(MatchRound.SEMI_FINAL);
            sf2.setMatchNumber(2);
            sf2.setParticipant1Id(participants.get(2).getParticipantId());
            sf2.setParticipant1Type(participants.get(2).getParticipantType());
            sf2.setParticipant2Id(participants.get(3).getParticipantId());
            sf2.setParticipant2Type(participants.get(3).getParticipantType());
            sf2.setStatus(MatchStatus.PENDING);
            sf2.setNextMatchId(finalMatch.getId());
            sf2.setNextMatchPosition(2);
            sf2.setCreatedAt(LocalDateTime.now());
            tournamentMatchRepository.save(sf2);

        } else if (tournament.getParticipantLimit() == 8) {
            // Save final first
            TournamentMatch finalMatch = new TournamentMatch();
            finalMatch.setTournamentId(tournamentId);
            finalMatch.setRound(MatchRound.FINAL);
            finalMatch.setMatchNumber(7);
            finalMatch.setStatus(MatchStatus.PENDING);
            finalMatch.setCreatedAt(LocalDateTime.now());
            finalMatch = tournamentMatchRepository.save(finalMatch);

            // Save SF1 and SF2
            TournamentMatch sf1 = new TournamentMatch();
            sf1.setTournamentId(tournamentId);
            sf1.setRound(MatchRound.SEMI_FINAL);
            sf1.setMatchNumber(5);
            sf1.setStatus(MatchStatus.PENDING);
            sf1.setNextMatchId(finalMatch.getId());
            sf1.setNextMatchPosition(1);
            sf1.setCreatedAt(LocalDateTime.now());
            sf1 = tournamentMatchRepository.save(sf1);

            TournamentMatch sf2 = new TournamentMatch();
            sf2.setTournamentId(tournamentId);
            sf2.setRound(MatchRound.SEMI_FINAL);
            sf2.setMatchNumber(6);
            sf2.setStatus(MatchStatus.PENDING);
            sf2.setNextMatchId(finalMatch.getId());
            sf2.setNextMatchPosition(2);
            sf2.setCreatedAt(LocalDateTime.now());
            sf2 = tournamentMatchRepository.save(sf2);

            // Save QF1-4
            TournamentMatch qf1 = new TournamentMatch();
            qf1.setTournamentId(tournamentId);
            qf1.setRound(MatchRound.QUARTER_FINAL);
            qf1.setMatchNumber(1);
            qf1.setParticipant1Id(participants.get(0).getParticipantId());
            qf1.setParticipant1Type(participants.get(0).getParticipantType());
            qf1.setParticipant2Id(participants.get(1).getParticipantId());
            qf1.setParticipant2Type(participants.get(1).getParticipantType());
            qf1.setStatus(MatchStatus.PENDING);
            qf1.setNextMatchId(sf1.getId());
            qf1.setNextMatchPosition(1);
            qf1.setCreatedAt(LocalDateTime.now());
            tournamentMatchRepository.save(qf1);

            TournamentMatch qf2 = new TournamentMatch();
            qf2.setTournamentId(tournamentId);
            qf2.setRound(MatchRound.QUARTER_FINAL);
            qf2.setMatchNumber(2);
            qf2.setParticipant1Id(participants.get(2).getParticipantId());
            qf2.setParticipant1Type(participants.get(2).getParticipantType());
            qf2.setParticipant2Id(participants.get(3).getParticipantId());
            qf2.setParticipant2Type(participants.get(3).getParticipantType());
            qf2.setStatus(MatchStatus.PENDING);
            qf2.setNextMatchId(sf1.getId());
            qf2.setNextMatchPosition(2);
            qf2.setCreatedAt(LocalDateTime.now());
            tournamentMatchRepository.save(qf2);

            TournamentMatch qf3 = new TournamentMatch();
            qf3.setTournamentId(tournamentId);
            qf3.setRound(MatchRound.QUARTER_FINAL);
            qf3.setMatchNumber(3);
            qf3.setParticipant1Id(participants.get(4).getParticipantId());
            qf3.setParticipant1Type(participants.get(4).getParticipantType());
            qf3.setParticipant2Id(participants.get(5).getParticipantId());
            qf3.setParticipant2Type(participants.get(5).getParticipantType());
            qf3.setStatus(MatchStatus.PENDING);
            qf3.setNextMatchId(sf2.getId());
            qf3.setNextMatchPosition(1);
            qf3.setCreatedAt(LocalDateTime.now());
            tournamentMatchRepository.save(qf3);

            TournamentMatch qf4 = new TournamentMatch();
            qf4.setTournamentId(tournamentId);
            qf4.setRound(MatchRound.QUARTER_FINAL);
            qf4.setMatchNumber(4);
            qf4.setParticipant1Id(participants.get(6).getParticipantId());
            qf4.setParticipant1Type(participants.get(6).getParticipantType());
            qf4.setParticipant2Id(participants.get(7).getParticipantId());
            qf4.setParticipant2Type(participants.get(7).getParticipantType());
            qf4.setStatus(MatchStatus.PENDING);
            qf4.setNextMatchId(sf2.getId());
            qf4.setNextMatchPosition(2);
            qf4.setCreatedAt(LocalDateTime.now());
            tournamentMatchRepository.save(qf4);
        }

        tournament.setStatus(TournamentStatus.IN_PROGRESS);
        tournament.setUpdatedAt(LocalDateTime.now());
        tournamentRepository.save(tournament);
    }

    @Override
    public void advanceWinner(TournamentMatch playedMatch, Tournament tournament) {
        String newWinnerId;
        ParticipantType newWinnerType;
        if (playedMatch.getScore1() > playedMatch.getScore2()) {
            newWinnerId = playedMatch.getParticipant1Id();
            newWinnerType = playedMatch.getParticipant1Type();
        } else {
            newWinnerId = playedMatch.getParticipant2Id();
            newWinnerType = playedMatch.getParticipant2Type();
        }

        String oldWinnerId = playedMatch.getWinnerId();
        boolean wasAlreadyPlayed = playedMatch.getStatus() == MatchStatus.PLAYED;
        boolean winnerChanged = wasAlreadyPlayed && !newWinnerId.equals(oldWinnerId);

        playedMatch.setWinnerId(newWinnerId);
        playedMatch.setWinnerType(newWinnerType);
        playedMatch.setStatus(MatchStatus.PLAYED);

        if (playedMatch.getRound() != MatchRound.FINAL && playedMatch.getNextMatchId() != null) {
            TournamentMatch nextMatch = tournamentMatchRepository.findById(playedMatch.getNextMatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Next match not found"));

            if (winnerChanged) {
                // Cascade-rollback the downstream match and beyond
                cascadeRollback(nextMatch, playedMatch.getNextMatchPosition(), newWinnerId, newWinnerType, tournament);
            } else if (!wasAlreadyPlayed) {
                // First time recording — place winner in next match
                placeWinnerInNextMatch(nextMatch, playedMatch.getNextMatchPosition(), newWinnerId, newWinnerType);
                tournamentMatchRepository.save(nextMatch);
            }
        }

        if (playedMatch.getRound() == MatchRound.FINAL) {
            tournament.setChampionId(newWinnerId);
            tournament.setChampionType(newWinnerType);
            tournament.setStatus(TournamentStatus.COMPLETED);
            tournament.setRegistrationOpen(false);
        }

        tournament.setUpdatedAt(LocalDateTime.now());
        tournamentRepository.save(tournament);
        tournamentMatchRepository.save(playedMatch);
    }

    /**
     * Place winner in the correct slot of the next match.
     * The match stays PENDING — it moves to READY only once the admin schedules it.
     */
    private void placeWinnerInNextMatch(TournamentMatch nextMatch, int position, String winnerId, ParticipantType winnerType) {
        if (position == 1) {
            nextMatch.setParticipant1Id(winnerId);
            nextMatch.setParticipant1Type(winnerType);
        } else {
            nextMatch.setParticipant2Id(winnerId);
            nextMatch.setParticipant2Type(winnerType);
        }
        // Do NOT set READY here — status moves to READY only when the admin assigns
        // a date and field via scheduleMatch().
    }

    /**
     * Handles the case where the winner of a match has changed due to a score edit.
     * Replaces the old winner in the downstream match; if that match was already PLAYED,
     * resets it and recurses up the chain.
     */
    private void cascadeRollback(TournamentMatch nextMatch, int position, String newWinnerId, ParticipantType newWinnerType, Tournament tournament) {
        boolean nextWasPlayed = nextMatch.getStatus() == MatchStatus.PLAYED;
        String nextOldWinnerId = nextMatch.getWinnerId();

        // Replace the old winner in the correct slot
        placeWinnerInNextMatch(nextMatch, position, newWinnerId, newWinnerType);

        if (nextWasPlayed) {
            // Reset this downstream match — scores and winner must be re-entered
            nextMatch.setScore1(null);
            nextMatch.setScore2(null);
            nextMatch.setWinnerId(null);
            nextMatch.setWinnerType(null);
            // Restore to READY only if already scheduled; otherwise fall back to PENDING
            nextMatch.setStatus(nextMatch.getScheduledDate() != null && nextMatch.getFieldId() != null
                    ? MatchStatus.READY
                    : MatchStatus.PENDING);
            tournamentMatchRepository.save(nextMatch);

            // If the next match was the FINAL and was completed, also reset the champion
            if (nextMatch.getRound() == MatchRound.FINAL) {
                tournament.setChampionId(null);
                tournament.setChampionType(null);
                if (tournament.getStatus() == TournamentStatus.COMPLETED) {
                    tournament.setStatus(TournamentStatus.IN_PROGRESS);
                    tournament.setRegistrationOpen(false);
                }
                tournamentRepository.save(tournament);
            }

            // Continue cascade further if needed
            if (nextMatch.getRound() != MatchRound.FINAL && nextMatch.getNextMatchId() != null && nextOldWinnerId != null) {
                TournamentMatch furtherMatch = tournamentMatchRepository.findById(nextMatch.getNextMatchId())
                        .orElseThrow(() -> new ResourceNotFoundException("Next match not found"));
                // We don't know the new winner yet (match was just reset), so just clean the old winner from that slot
                removeParticipantFromMatch(furtherMatch, nextOldWinnerId, nextMatch.getNextMatchPosition());
                tournamentMatchRepository.save(furtherMatch);
            }
        } else {
            tournamentMatchRepository.save(nextMatch);
        }
    }

    /**
     * Removes a specific participant from a match slot (used during cascade rollback).
     */
    private void removeParticipantFromMatch(TournamentMatch match, String participantId, int position) {
        if (position == 1 && participantId.equals(match.getParticipant1Id())) {
            match.setParticipant1Id(null);
            match.setParticipant1Type(null);
        } else if (position == 2 && participantId.equals(match.getParticipant2Id())) {
            match.setParticipant2Id(null);
            match.setParticipant2Type(null);
        }
        // If match was READY but now missing a participant, set it back to PENDING
        if (match.getStatus() == MatchStatus.READY
                && (match.getParticipant1Id() == null || match.getParticipant2Id() == null)) {
            match.setStatus(MatchStatus.PENDING);
        }
    }

    @Override
    public BracketResponse getBracket(String tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        Sport sport = sportRepository.findById(tournament.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));
        ParticipantType pType = sport.isTeamEnabled() ? ParticipantType.TEAM : ParticipantType.PLAYER;

        List<TournamentMatch> matches = tournamentMatchRepository.findByTournamentId(tournamentId);

        TournamentMatch finalMatch = matches.stream()
                .filter(m -> m.getRound() == MatchRound.FINAL)
                .findFirst()
                .orElse(null);

        BracketResponse.ParticipantSummary championSummary = null;
        if (tournament.getStatus() == TournamentStatus.COMPLETED && tournament.getChampionId() != null) {
            championSummary = resolveParticipantSummary(tournament.getChampionId(), tournament.getChampionType() != null ? tournament.getChampionType() : pType);
        }

        BracketResponse.BracketMatchNode finalNode = mapToNode(finalMatch, matches, pType);

        return new BracketResponse(
                tournamentId,
                pType,
                championSummary,
                finalNode
        );
    }

    private BracketResponse.BracketMatchNode mapToNode(TournamentMatch match, List<TournamentMatch> allMatches, ParticipantType participantType) {
        if (match == null) return null;

        BracketResponse.BracketMatchNode node = new BracketResponse.BracketMatchNode();
        node.setId(match.getId());
        node.setTournamentId(match.getTournamentId());
        node.setRound(match.getRound());
        node.setMatchNumber(match.getMatchNumber());
        node.setParticipant1Id(match.getParticipant1Id());
        node.setParticipant1Type(match.getParticipant1Type());
        node.setParticipant2Id(match.getParticipant2Id());
        node.setParticipant2Type(match.getParticipant2Type());
        node.setScore1(match.getScore1());
        node.setScore2(match.getScore2());
        node.setWinnerId(match.getWinnerId());
        node.setWinnerType(match.getWinnerType());
        node.setStatus(match.getStatus());
        node.setNextMatchId(match.getNextMatchId());
        node.setNextMatchPosition(match.getNextMatchPosition());
        node.setScheduledDate(match.getScheduledDate());
        node.setFieldId(match.getFieldId());
        node.setCreatedAt(match.getCreatedAt());

        node.setParticipant1(resolveParticipantSummary(match.getParticipant1Id(), match.getParticipant1Type() != null ? match.getParticipant1Type() : participantType));
        node.setParticipant2(resolveParticipantSummary(match.getParticipant2Id(), match.getParticipant2Type() != null ? match.getParticipant2Type() : participantType));
        node.setWinner(resolveParticipantSummary(match.getWinnerId(), match.getWinnerType() != null ? match.getWinnerType() : participantType));

        TournamentMatch child1 = allMatches.stream()
                .filter(m -> match.getId().equals(m.getNextMatchId()) && Integer.valueOf(1).equals(m.getNextMatchPosition()))
                .findFirst().orElse(null);
        TournamentMatch child2 = allMatches.stream()
                .filter(m -> match.getId().equals(m.getNextMatchId()) && Integer.valueOf(2).equals(m.getNextMatchPosition()))
                .findFirst().orElse(null);

        if (match.getRound() == MatchRound.FINAL) {
            node.setSemiFinal1(mapToNode(child1, allMatches, participantType));
            node.setSemiFinal2(mapToNode(child2, allMatches, participantType));
            node.setQuarterFinal1(null);
            node.setQuarterFinal2(null);
        } else if (match.getRound() == MatchRound.SEMI_FINAL) {
            node.setSemiFinal1(null);
            node.setSemiFinal2(null);
            node.setQuarterFinal1(mapToNode(child1, allMatches, participantType));
            node.setQuarterFinal2(mapToNode(child2, allMatches, participantType));
        } else {
            node.setSemiFinal1(null);
            node.setSemiFinal2(null);
            node.setQuarterFinal1(null);
            node.setQuarterFinal2(null);
        }

        return node;
    }

    private BracketResponse.ParticipantSummary resolveParticipantSummary(String id, ParticipantType type) {
        if (id == null || type == null) return null;
        String name = "Unknown";
        String logoUrl = null;
        String player1Id = null;
        String player2Id = null;
        String player1PhotoUrl = null;
        String player2PhotoUrl = null;
        if (type == ParticipantType.TEAM) {
            Team team = teamRepository.findById(id).orElse(null);
            name = team != null ? team.getTeamName() : "Unknown Team";
            if (team != null && team.getLogoFileId() != null) {
                logoUrl = baseUrl + "/api/captain/team/logo/" + team.getLogoFileId();
            }
        } else if (type == ParticipantType.PLAYER) {
            Player p = playerRepository.findById(id).orElse(null);
            name = p != null ? p.getFullName() : "Unknown Player";
            logoUrl = p != null ? p.getPhotoUrl() : null;
        } else if (type == ParticipantType.DOUBLES_TEAM) {
            DoublesTeam dt = doublesTeamRepository.findById(id).orElse(null);
            name = dt != null ? dt.getTeamName() : "Unknown Pair";
            player1Id = dt != null ? dt.getPlayer1Id() : null;
            player2Id = dt != null ? dt.getPlayer2Id() : null;
            if (player1Id != null)
                player1PhotoUrl = playerRepository.findById(player1Id).map(Player::getPhotoUrl).orElse(null);
            if (player2Id != null)
                player2PhotoUrl = playerRepository.findById(player2Id).map(Player::getPhotoUrl).orElse(null);
            logoUrl = player1PhotoUrl;
        }
        return new BracketResponse.ParticipantSummary(id, name, logoUrl, player1Id, player2Id, player1PhotoUrl, player2PhotoUrl);
    }
}
