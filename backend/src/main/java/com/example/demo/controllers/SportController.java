package com.example.demo.controllers;

import com.example.demo.dto.SportDto;
import com.example.demo.services.SportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/sports")
@RequiredArgsConstructor
public class SportController {

    private final SportService sportService;

    /**
     * GET /api/sports
     * Public — returns all sports.
     */
    @GetMapping
    public ResponseEntity<List<SportDto>> getAllSports() {
        return ResponseEntity.ok(sportService.getAllSports());
    }

    /**
     * GET /api/sports/team
     * Public — returns Football and Basketball only (for captain registration).
     */
    @GetMapping("/team")
    public ResponseEntity<List<SportDto>> getTeamSports() {
        return ResponseEntity.ok(sportService.getTeamSports());
    }

    /**
     * GET /api/sports/individual
     * Public — returns Tennis and Padel only (for player registration).
     */
    @GetMapping("/individual")
    public ResponseEntity<List<SportDto>> getIndividualSports() {
        return ResponseEntity.ok(sportService.getIndividualSports());
    }

    /**
     * POST /api/sports
     * Admin only — create a new sport with an icon.
     * Multipart: sportName (text) + icon (file) + scoringRule (text) + maxPlayers (int).
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SportDto> createSport(
            @RequestParam("sportName") String sportName,
            @RequestParam(value = "icon", required = false) MultipartFile icon,
            @RequestParam(value = "scoringRule", required = false, defaultValue = "") String scoringRule,
            @RequestParam(value = "maxPlayers", required = false, defaultValue = "0") int maxPlayers)
            throws IOException {

        SportDto dto = sportService.createSport(sportName, icon, scoringRule, maxPlayers);
        return ResponseEntity.ok(dto);
    }

    /**
     * GET /api/sports/icon/{fileId}
     * Public — streams the icon image stored in GridFS with the correct content type.
     */
    @GetMapping("/icon/{fileId}")
    public ResponseEntity<byte[]> getIcon(@PathVariable String fileId) throws IOException {
        SportService.IconResource resource = sportService.getIcon(fileId);
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(resource.getContentType());
        } catch (Exception e) {
            mediaType = MediaType.IMAGE_PNG;
        }
        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(resource.getData());
    }
}
