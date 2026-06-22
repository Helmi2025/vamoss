package com.example.demo.services;

import com.example.demo.dto.SportDto;
import com.example.demo.entities.Sport;
import com.example.demo.repositories.SportRepository;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SportService {

    private final SportRepository sportRepository;
    private final GridFsTemplate gridFsTemplate;
    private final GridFsOperations gridFsOperations;

    @Value("${app.base-url}")
    private String baseUrl;

    // Sport names that support team/captain functionality
    private static final List<String> TEAM_SPORT_NAMES       = List.of("Football", "Basketball");
    private static final List<String> INDIVIDUAL_SPORT_NAMES = List.of("Tennis", "Padel");

    // ── Create sport with icon ──────────────────────────────────────────────────

    public SportDto createSport(String sportName, MultipartFile icon,
                                String scoringRule, int maxPlayers) throws IOException {
        if (sportRepository.existsBySportName(sportName)) {
            throw new RuntimeException("Sport already exists: " + sportName);
        }

        String iconFileId = null;
        if (icon != null && !icon.isEmpty()) {
            ObjectId fileId = gridFsTemplate.store(
                    icon.getInputStream(),
                    icon.getOriginalFilename(),
                    icon.getContentType()
            );
            iconFileId = fileId.toString();
        }

        Sport sport = new Sport(null, sportName, iconFileId, scoringRule, maxPlayers,
                isTeamSport(sportName));
        Sport saved = sportRepository.save(sport);
        return toDto(saved);
    }

    // ── Get all sports ──────────────────────────────────────────────────────────

    public List<SportDto> getAllSports() {
        return sportRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ── Team sports only — Football & Basketball ────────────────────────────────

    public List<SportDto> getTeamSports() {
        return sportRepository.findBySportNameIn(TEAM_SPORT_NAMES).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ── Individual sports only — Tennis & Padel ─────────────────────────────────

    public List<SportDto> getIndividualSports() {
        return sportRepository.findBySportNameIn(INDIVIDUAL_SPORT_NAMES).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ── Get sport by id ─────────────────────────────────────────────────────────

    public Sport getById(String id) {
        return sportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sport not found: " + id));
    }

    // ── Retrieve icon from GridFS ───────────────────────────────────────────────

    public IconResource getIcon(String fileId) throws IOException {
        GridFSFile file = gridFsTemplate.findOne(
                new Query(Criteria.where("_id").is(new ObjectId(fileId)))
        );
        if (file == null) throw new RuntimeException("Icon not found: " + fileId);

        String contentType = "image/png";
        if (file.getMetadata() != null) {
            Object ct = file.getMetadata().get("_contentType");
            if (ct instanceof String s && !s.isBlank()) {
                contentType = s;
            }
        }

        InputStream is = gridFsOperations.getResource(file).getInputStream();
        byte[] data = is.readAllBytes();
        is.close();
        return new IconResource(data, contentType);
    }

    /** Carries both the raw bytes and the detected content type. */
    public static class IconResource {
        private final byte[] data;
        private final String contentType;
        public IconResource(byte[] data, String contentType) {
            this.data        = data;
            this.contentType = contentType;
        }
        public byte[]  getData()        { return data; }
        public String  getContentType() { return contentType; }
    }

    // Expose for validation use in other services
    public boolean isTeamSportName(String name) {
        return TEAM_SPORT_NAMES.stream().anyMatch(n -> n.equalsIgnoreCase(name));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private boolean isTeamSport(String name) {
        return TEAM_SPORT_NAMES.stream().anyMatch(n -> n.equalsIgnoreCase(name));
    }

    private SportDto toDto(Sport sport) {
        String iconUrl = sport.getIconFileId() != null
                ? baseUrl + "/api/sports/icon/" + sport.getIconFileId()
                : null;
        boolean teamEnabled = isTeamSport(sport.getSportName());
        return new SportDto(sport.getId(), sport.getSportName(), iconUrl,
                sport.getScoringRule(), sport.getMaxPlayers(), teamEnabled);
    }
}
