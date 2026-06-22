package com.example.demo.services;

import com.example.demo.dto.*;
import com.example.demo.entities.*;
import com.example.demo.exceptions.BusinessException;
import com.example.demo.exceptions.ConflictException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.*;
import com.example.demo.tournament.GenderCategory;
import com.example.demo.tournament.ParticipantType;
import com.example.demo.tournament.TournamentFormat;
import com.example.demo.tournament.TournamentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TournamentServiceImpl implements TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentParticipantRepository tournamentParticipantRepository;
    private final DoublesTeamRepository doublesTeamRepository;
    private final SportRepository sportRepository;
    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final BracketService bracketService;

    @Value("${app.base-url}")
    private String baseUrl;

    @Autowired
    public TournamentServiceImpl(
            TournamentRepository tournamentRepository,
            TournamentParticipantRepository tournamentParticipantRepository,
            DoublesTeamRepository doublesTeamRepository,
            SportRepository sportRepository,
            TeamRepository teamRepository,
            PlayerRepository playerRepository,
            FriendRequestRepository friendRequestRepository,
            TournamentMatchRepository tournamentMatchRepository,
            @Lazy BracketService bracketService) {
        this.tournamentRepository = tournamentRepository;
        this.tournamentParticipantRepository = tournamentParticipantRepository;
        this.doublesTeamRepository = doublesTeamRepository;
        this.sportRepository = sportRepository;
        this.teamRepository = teamRepository;
        this.playerRepository = playerRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.tournamentMatchRepository = tournamentMatchRepository;
        this.bracketService = bracketService;
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private static final Set<String> TENNIS_PADEL = Set.of("tennis", "padel");

    private boolean isTennisPadelSport(Sport sport) {
        return sport.getSportName() != null
                && TENNIS_PADEL.contains(sport.getSportName().toLowerCase());
    }

    private boolean playerMatchesGender(Player player, GenderCategory category) {
        if (category == null || category == GenderCategory.OPEN) return true;
        if (player.getGender() == null) return false;
        return (category == GenderCategory.MEN   && player.getGender() == Player.Gender.MALE)
            || (category == GenderCategory.WOMEN && player.getGender() == Player.Gender.FEMALE);
    }

    private boolean areFriends(String a, String b) {
        return friendRequestRepository.findBySenderIdAndReceiverId(a, b)
                .filter(r -> r.getStatus() == FriendRequest.Status.ACCEPTED).isPresent()
            || friendRequestRepository.findBySenderIdAndReceiverId(b, a)
                .filter(r -> r.getStatus() == FriendRequest.Status.ACCEPTED).isPresent();
    }

    /** Close registration when full and trigger bracket generation. */
    private void finaliseRegistration(Tournament t) {
        if (t.getCurrentParticipants() == t.getParticipantLimit()) {
            t.setRegistrationOpen(false);
            t.setStatus(TournamentStatus.READY);
        }
        t.setUpdatedAt(LocalDateTime.now());
        tournamentRepository.save(t);
        if (t.getStatus() == TournamentStatus.READY) {
            bracketService.generateBracket(t.getId());
        }
    }

    // ── CREATE ──────────────────────────────────────────────────────────────────

    @Override
    public TournamentResponse create(TournamentCreateRequest request) {
        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));

        if (request.getStartDate() != null && request.getEndDate() != null
                && !request.getEndDate().isAfter(request.getStartDate())) {
            throw new BusinessException("End date must be after start date");
        }
        if (request.getStartDate() != null && request.getStartDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Start date must be today or in the future");
        }
        if (isTennisPadelSport(sport)) {
            if (request.getFormat() == null) {
                throw new BusinessException("Format (SINGLES or DOUBLES) is required for Tennis/Padel tournaments");
            }
            if (request.getGenderCategory() == null) {
                throw new BusinessException("Gender category (MEN, WOMEN, or OPEN) is required for Tennis/Padel tournaments");
            }
        }

        Tournament tournament = new Tournament();
        tournament.setName(request.getName());
        tournament.setSportId(request.getSportId());
        tournament.setParticipantLimit(request.getParticipantLimit());
        tournament.setCurrentParticipants(0);
        tournament.setStatus(TournamentStatus.REGISTRATION_OPEN);
        tournament.setChampionId(null);
        tournament.setChampionType(null);
        tournament.setRegistrationOpen(true);
        tournament.setFormat(isTennisPadelSport(sport) ? request.getFormat() : null);
        tournament.setGenderCategory(isTennisPadelSport(sport) ? request.getGenderCategory() : null);
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setCreatedAt(LocalDateTime.now());
        tournament.setUpdatedAt(LocalDateTime.now());

        return toResponse(tournamentRepository.save(tournament));
    }

    // ── READ ───────────────────────────────────────────────────────────────────

    @Override
    public List<TournamentResponse> getAll() {
        return tournamentRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public TournamentResponse getById(String id) {
        return toResponse(tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found")));
    }

    // ── UPDATE ─────────────────────────────────────────────────────────────────

    @Override
    public TournamentResponse update(String id, TournamentUpdateRequest request) {
        Tournament t = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        if (t.getStatus() == TournamentStatus.COMPLETED)
            throw new ConflictException("Completed tournaments cannot be modified");

        if (request.getEndDate() != null && request.getStartDate() != null
                && !request.getEndDate().isAfter(request.getStartDate()))
            throw new BusinessException("End date must be after start date");

        LocalDate oldStart = t.getStartDate(), oldEnd = t.getEndDate();
        LocalDate newStart = request.getStartDate(), newEnd = request.getEndDate();
        boolean dateRangeChanging = (newStart != null && !newStart.equals(oldStart))
                || (newEnd != null && !newEnd.equals(oldEnd));

        if (dateRangeChanging && oldStart != null && oldEnd != null) {
            List<TournamentMatch> scheduled = tournamentMatchRepository
                    .findByTournamentIdAndScheduledDateBetween(
                            id, oldStart.atStartOfDay(), oldEnd.atTime(23, 59, 59));
            for (TournamentMatch m : scheduled) {
                if (m.getScheduledDate() == null) continue;
                LocalDate md = m.getScheduledDate().toLocalDate();
                if (newStart == null || newEnd == null || md.isBefore(newStart) || md.isAfter(newEnd))
                    throw new ConflictException("Cannot change the tournament dates: match scheduled on "
                            + md + " falls outside the new date range (" + newStart + " – " + newEnd + ")");
            }
        }

        t.setName(request.getName());
        t.setStartDate(newStart);
        t.setEndDate(newEnd);
        t.setUpdatedAt(LocalDateTime.now());
        return toResponse(tournamentRepository.save(t));
    }

    // ── CANCEL / DELETE ────────────────────────────────────────────────────────

    @Override
    public void cancel(String id) {
        Tournament t = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (t.getStatus() == TournamentStatus.COMPLETED)
            throw new ConflictException("Completed tournaments cannot be modified");
        t.setStatus(TournamentStatus.CANCELLED);
        t.setRegistrationOpen(false);
        t.setUpdatedAt(LocalDateTime.now());
        tournamentRepository.save(t);
    }

    @Override
    public void delete(String id) {
        Tournament t = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (t.getStatus() != TournamentStatus.CANCELLED && t.getStatus() != TournamentStatus.REGISTRATION_OPEN)
            throw new ConflictException("Only CANCELLED or REGISTRATION_OPEN tournaments can be deleted");
        tournamentParticipantRepository.deleteByTournamentId(id);
        if (doublesTeamRepository != null) doublesTeamRepository.deleteByTournamentId(id);
        tournamentRepository.deleteById(id);
    }

    // ── REGISTER TEAM ──────────────────────────────────────────────────────────

    @Override
    public TournamentParticipantResponse registerTeam(String tournamentId, RegisterTeamRequest request) {
        Tournament t = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (!t.isRegistrationOpen()) throw new BusinessException("Registration is closed for this tournament");

        Sport sport = sportRepository.findById(t.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));
        if (!sport.isTeamEnabled()) throw new BusinessException("This tournament only accepts individual players");

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        if (team.getSportId() == null || !team.getSportId().equals(t.getSportId()))
            throw new BusinessException("Participant sport does not match tournament sport");
        if (tournamentParticipantRepository.existsByTournamentIdAndParticipantId(tournamentId, request.getTeamId()))
            throw new ConflictException("Participant is already registered");

        TournamentParticipant p = new TournamentParticipant();
        p.setTournamentId(tournamentId);
        p.setParticipantId(request.getTeamId());
        p.setParticipantType(ParticipantType.TEAM);
        TournamentParticipant saved = tournamentParticipantRepository.save(p);

        t.setCurrentParticipants(t.getCurrentParticipants() + 1);
        finaliseRegistration(t);
        return toParticipantResponse(saved);
    }

    @Override
    public void unregisterTeam(String tournamentId, String captainId) {
        Tournament t = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (t.getStatus() != TournamentStatus.REGISTRATION_OPEN)
            throw new BusinessException("You can only unregister while registration is open");
        Team team = teamRepository.findByCaptainId(captainId)
                .orElseThrow(() -> new ResourceNotFoundException("No team found for this captain"));
        if (!tournamentParticipantRepository.existsByTournamentIdAndParticipantId(tournamentId, team.getId()))
            throw new ResourceNotFoundException("Your team is not registered in this tournament");
        removeParticipant(tournamentId, team.getId());
    }

    // ── REGISTER SINGLES PLAYER ────────────────────────────────────────────────

    @Override
    public TournamentParticipantResponse registerPlayer(String tournamentId, RegisterPlayerRequest request) {
        Tournament t = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (!t.isRegistrationOpen()) throw new BusinessException("Registration is closed for this tournament");

        Sport sport = sportRepository.findById(t.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));
        if (sport.isTeamEnabled()) throw new BusinessException("This tournament only accepts teams");
        if (t.getFormat() == TournamentFormat.DOUBLES)
            throw new BusinessException("This is a doubles tournament. Use the doubles registration endpoint");

        Player player = playerRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));
        if (player.getSportId() == null || !player.getSportId().equals(t.getSportId()))
            throw new BusinessException("Participant sport does not match tournament sport");
        if (!playerMatchesGender(player, t.getGenderCategory()))
            throw new BusinessException("Player does not meet the gender requirement for this tournament");
        if (tournamentParticipantRepository.existsByTournamentIdAndParticipantId(tournamentId, request.getPlayerId()))
            throw new ConflictException("Participant is already registered");

        TournamentParticipant p = new TournamentParticipant();
        p.setTournamentId(tournamentId);
        p.setParticipantId(request.getPlayerId());
        p.setParticipantType(ParticipantType.PLAYER);
        TournamentParticipant saved = tournamentParticipantRepository.save(p);

        t.setCurrentParticipants(t.getCurrentParticipants() + 1);
        finaliseRegistration(t);
        return toParticipantResponse(saved);
    }

    @Override
    public void unregisterPlayer(String tournamentId, String playerId) {
        Tournament t = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (t.getStatus() != TournamentStatus.REGISTRATION_OPEN)
            throw new BusinessException("You can only unregister while registration is open");

        // For doubles tournaments the TournamentParticipant stores the DoublesTeam id,
        // not the individual player id — resolve the actual participant id first.
        String participantId = playerId;
        if (t.getFormat() == TournamentFormat.DOUBLES) {
            DoublesTeam dt = doublesTeamRepository
                    .findByTournamentIdAndPlayer(tournamentId, playerId)
                    .orElseThrow(() -> new ResourceNotFoundException("You are not registered in this tournament"));
            participantId = dt.getId();
        }

        if (!tournamentParticipantRepository.existsByTournamentIdAndParticipantId(tournamentId, participantId))
            throw new ResourceNotFoundException("You are not registered in this tournament");
        removeParticipant(tournamentId, participantId);
    }

    // ── REGISTER DOUBLES PAIR ──────────────────────────────────────────────────

    @Override
    public DoublesTeamResponse registerDoubles(String tournamentId, RegisterDoublesRequest request) {
        Tournament t = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (!t.isRegistrationOpen()) throw new BusinessException("Registration is closed for this tournament");

        Sport sport = sportRepository.findById(t.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));
        if (sport.isTeamEnabled()) throw new BusinessException("This tournament only accepts teams");
        if (t.getFormat() != TournamentFormat.DOUBLES)
            throw new BusinessException("This is a singles tournament. Use the singles registration endpoint");

        String playerId = request.getPlayerId();
        String partnerId = request.getPartnerId();
        if (playerId.equals(partnerId)) throw new BusinessException("You cannot pair with yourself");

        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));
        Player partner = playerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));

        if (player.getSportId() == null || !player.getSportId().equals(t.getSportId()))
            throw new BusinessException("Player's sport does not match the tournament sport");
        if (partner.getSportId() == null || !partner.getSportId().equals(t.getSportId()))
            throw new BusinessException("Partner's sport does not match the tournament sport");
        if (!playerMatchesGender(player, t.getGenderCategory()))
            throw new BusinessException("Player does not meet the gender requirement for this tournament");
        if (!playerMatchesGender(partner, t.getGenderCategory()))
            throw new BusinessException("Partner does not meet the gender requirement for this tournament");
        if (!areFriends(playerId, partnerId))
            throw new BusinessException("Selected partner is not in your friend list");
        if (doublesTeamRepository.findByTournamentIdAndPlayer(tournamentId, playerId).isPresent())
            throw new ConflictException("You are already registered in this tournament");
        if (doublesTeamRepository.findByTournamentIdAndPlayer(tournamentId, partnerId).isPresent())
            throw new ConflictException("The selected partner is already registered in this tournament");

        DoublesTeam dt = new DoublesTeam();
        dt.setTournamentId(tournamentId);
        dt.setPlayer1Id(playerId);
        dt.setPlayer2Id(partnerId);
        dt.setTeamName(player.getFullName() + " & " + partner.getFullName());
        dt.setRegisteredAt(LocalDateTime.now());
        DoublesTeam saved = doublesTeamRepository.save(dt);

        TournamentParticipant p = new TournamentParticipant();
        p.setTournamentId(tournamentId);
        p.setParticipantId(saved.getId());
        p.setParticipantType(ParticipantType.DOUBLES_TEAM);
        tournamentParticipantRepository.save(p);

        t.setCurrentParticipants(t.getCurrentParticipants() + 1);
        finaliseRegistration(t);

        return new DoublesTeamResponse(saved.getId(), tournamentId,
                playerId, player.getFullName(), partnerId, partner.getFullName(), saved.getTeamName());
    }

    // ── MY DOUBLES TEAM ───────────────────────────────────────────────────────

    @Override
    public DoublesTeamResponse getMyDoublesTeam(String tournamentId, String playerId) {
        DoublesTeam dt = doublesTeamRepository.findByTournamentIdAndPlayer(tournamentId, playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Not registered in this doubles tournament"));
        Player p1 = playerRepository.findById(dt.getPlayer1Id()).orElse(null);
        Player p2 = playerRepository.findById(dt.getPlayer2Id()).orElse(null);
        return new DoublesTeamResponse(
                dt.getId(), tournamentId,
                dt.getPlayer1Id(), p1 != null ? p1.getFullName() : dt.getPlayer1Id(),
                dt.getPlayer2Id(), p2 != null ? p2.getFullName() : dt.getPlayer2Id(),
                dt.getTeamName());
    }

    // ── ELIGIBLE PARTNERS ──────────────────────────────────────────────────────

    @Override
    public List<EligibleFriendDto> getEligiblePartners(String tournamentId, String playerId) {
        Tournament t = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (!t.isRegistrationOpen()) throw new BusinessException("Registration is closed for this tournament");
        if (t.getFormat() != TournamentFormat.DOUBLES)
            throw new BusinessException("This tournament is not a doubles tournament");

        // All player IDs already in the tournament
        Set<String> taken = doublesTeamRepository.findByTournamentId(tournamentId).stream()
                .flatMap(dt -> java.util.stream.Stream.of(dt.getPlayer1Id(), dt.getPlayer2Id()))
                .collect(Collectors.toSet());

        List<Player> friends = new ArrayList<>();
        friendRequestRepository.findBySenderIdAndStatus(playerId, FriendRequest.Status.ACCEPTED)
                .forEach(r -> playerRepository.findById(r.getReceiverId()).ifPresent(friends::add));
        friendRequestRepository.findByReceiverIdAndStatus(playerId, FriendRequest.Status.ACCEPTED)
                .forEach(r -> playerRepository.findById(r.getSenderId()).ifPresent(friends::add));

        return friends.stream()
                .filter(f -> !taken.contains(f.getUserId()))
                .filter(f -> playerMatchesGender(f, t.getGenderCategory()))
                .map(f -> new EligibleFriendDto(f.getUserId(), f.getFullName(), f.getPhotoUrl(), f.getGender()))
                .collect(Collectors.toList());
    }

    // ── REMOVE PARTICIPANT (admin) ─────────────────────────────────────────────

    @Override
    public void removeParticipant(String tournamentId, String participantId) {
        Tournament t = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (t.getStatus() == TournamentStatus.BRACKET_GENERATED
                || t.getStatus() == TournamentStatus.IN_PROGRESS
                || t.getStatus() == TournamentStatus.COMPLETED)
            throw new ConflictException("Participants cannot be removed after the bracket has been generated");
        if (!tournamentParticipantRepository.existsByTournamentIdAndParticipantId(tournamentId, participantId))
            throw new ResourceNotFoundException("Participant not registered in this tournament");

        tournamentParticipantRepository.deleteByTournamentIdAndParticipantId(tournamentId, participantId);
        // Clean up doubles team document if this participant was one
        if (doublesTeamRepository != null) {
            doublesTeamRepository.findById(participantId)
                    .ifPresent(dt -> doublesTeamRepository.deleteById(participantId));
        }

        t.setCurrentParticipants(Math.max(0, t.getCurrentParticipants() - 1));
        if (!t.isRegistrationOpen() && t.getStatus() == TournamentStatus.READY) {
            t.setRegistrationOpen(true);
            t.setStatus(TournamentStatus.REGISTRATION_OPEN);
        }
        t.setUpdatedAt(LocalDateTime.now());
        tournamentRepository.save(t);
    }

    // ── PARTICIPANTS ───────────────────────────────────────────────────────────

    @Override
    public List<TournamentParticipantResponse> getParticipants(String tournamentId) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        return tournamentParticipantRepository.findByTournamentId(tournamentId).stream()
                .map(this::toParticipantResponse).collect(Collectors.toList());
    }

    @Override
    public List<BracketResponse.ParticipantSummary> getParticipantDetails(String tournamentId) {
        tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        return tournamentParticipantRepository.findByTournamentId(tournamentId).stream()
                .map(tp -> resolveParticipantSummary(tp.getParticipantId(), tp.getParticipantType()))
                .collect(Collectors.toList());
    }

    // ── MAPPING ────────────────────────────────────────────────────────────────

    private TournamentResponse toResponse(Tournament t) {
        return new TournamentResponse(
                t.getId(), t.getName(), t.getSportId(),
                t.getParticipantLimit(), t.getCurrentParticipants(),
                t.getStatus(), t.getChampionId(), t.getChampionType(),
                t.isRegistrationOpen(), t.getFormat(), t.getGenderCategory(),
                t.getStartDate(), t.getEndDate(), t.getCreatedAt(), t.getUpdatedAt());
    }

    private TournamentParticipantResponse toParticipantResponse(TournamentParticipant tp) {
        return new TournamentParticipantResponse(
                tp.getId(), tp.getTournamentId(), tp.getParticipantId(), tp.getParticipantType());
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
            if (team != null && team.getLogoFileId() != null)
                logoUrl = baseUrl + "/api/captain/team/logo/" + team.getLogoFileId();
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
            // logoUrl = photo of the registrant (player1) so bracket cards get a single image
            logoUrl = player1PhotoUrl;
        }
        return new BracketResponse.ParticipantSummary(id, name, logoUrl, player1Id, player2Id, player1PhotoUrl, player2PhotoUrl);
    }
}
