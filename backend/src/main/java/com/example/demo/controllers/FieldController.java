package com.example.demo.controllers;

import com.example.demo.dto.FieldDto;
import com.example.demo.dto.FieldReservationDto;
import com.example.demo.entities.Tournament;
import com.example.demo.entities.TournamentMatch;
import com.example.demo.repositories.TournamentMatchRepository;
import com.example.demo.repositories.TournamentRepository;
import com.example.demo.services.FieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fields")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FieldController {

    private final FieldService fieldService;
    private final TournamentMatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;

    /**
     * GET /api/fields
     * Returns all fields. Optional filters: ?sportId=... or ?available=true/false
     */
    @GetMapping
    public ResponseEntity<List<FieldDto>> getAll(
            @RequestParam(required = false) String sportId,
            @RequestParam(required = false) Boolean available) {

        if (Boolean.TRUE.equals(available) || (available == null && sportId == null)) {
            // No filters → return everything
            if (sportId == null && available == null) {
                return ResponseEntity.ok(fieldService.getAllFields());
            }
            // Available filter with optional sport
            return ResponseEntity.ok(fieldService.getAvailableFields(sportId));
        }

        // Sport filter only
        if (sportId != null) {
            return ResponseEntity.ok(fieldService.getFieldsBySport(sportId));
        }

        return ResponseEntity.ok(fieldService.getAllFields());
    }

    /**
     * GET /api/fields/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FieldDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(fieldService.getFieldById(id));
    }

    /**
     * POST /api/fields
     * Admin only — create a field linked to a sport.
     * Body: { "name": "Field A", "sportId": "..." }
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FieldDto> create(@RequestBody Map<String, String> body) {
        String name    = body.get("name");
        String sportId = body.get("sportId");

        if (name == null || name.isBlank())    throw new RuntimeException("Field name is required");
        if (sportId == null || sportId.isBlank()) throw new RuntimeException("sportId is required");

        return ResponseEntity.ok(fieldService.createField(name, sportId));
    }

    /**
     * PUT /api/fields/{id}
     * Admin only — update name, sportId, or availability.
     * Body (all optional): { "name": "...", "sportId": "...", "available": true }
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FieldDto> update(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {

        String  name      = (String)  body.get("name");
        String  sportId   = (String)  body.get("sportId");
        Boolean available = body.get("available") instanceof Boolean
                ? (Boolean) body.get("available") : null;

        return ResponseEntity.ok(fieldService.updateField(id, name, sportId, available));
    }

    /**
     * PATCH /api/fields/{id}/availability
     * Admin only — toggle availability quickly.
     * Body: { "available": true }
     */
    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FieldDto> setAvailability(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> body) {

        Boolean available = body.get("available");
        if (available == null) throw new RuntimeException("'available' field is required");
        return ResponseEntity.ok(fieldService.setAvailability(id, available));
    }

    /**
     * GET /api/fields/{id}/reservations
     * Admin only — returns all past and future 2-hour booking slots for a field,
     * ordered chronologically. Each slot covers [scheduledDate, scheduledDate + 2h).
     */
    @GetMapping("/{id}/reservations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FieldReservationDto>> getReservations(@PathVariable String id) {
        LocalDateTime now = LocalDateTime.now();

        List<TournamentMatch> matches =
                matchRepository.findByFieldIdAndScheduledDateNotNullOrderByScheduledDateAsc(id);

        List<FieldReservationDto> reservations = matches.stream().map(m -> {
            LocalDateTime start = m.getScheduledDate();
            LocalDateTime end   = start.plusHours(2);

            // Resolve tournament name
            String tournamentName = tournamentRepository.findById(m.getTournamentId())
                    .map(Tournament::getName)
                    .orElse("Unknown Tournament");

            String round = m.getRound() != null ? m.getRound().name().replace('_', ' ') : "Match";
            String label = round + " – Match " + m.getMatchNumber();

            boolean active = !now.isBefore(start) && now.isBefore(end);

            return new FieldReservationDto(m.getId(), label, tournamentName, start, end, active);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(reservations);
    }

    /**
     * DELETE /api/fields/{id}
     * Admin only.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        fieldService.deleteField(id);
        return ResponseEntity.noContent().build();
    }
}
