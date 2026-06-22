package com.example.demo.services;

import com.example.demo.dto.FieldDto;
import com.example.demo.entities.Field;
import com.example.demo.entities.Sport;
import com.example.demo.repositories.FieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FieldService {

    private final FieldRepository fieldRepository;
    private final SportService sportService;

    // ── Create ──────────────────────────────────────────────────────────────────

    public FieldDto createField(String name, String sportId) {
        // Verify sport exists
        Sport sport = sportService.getById(sportId);

        if (fieldRepository.existsByNameAndSportId(name, sportId)) {
            throw new RuntimeException("A field named '" + name + "' already exists for this sport");
        }

        Field field = new Field(null, name, true, sportId);
        Field saved = fieldRepository.save(field);
        return toDto(saved, sport.getSportName());
    }

    // ── Get all ─────────────────────────────────────────────────────────────────

    public List<FieldDto> getAllFields() {
        return fieldRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ── Get by sport ────────────────────────────────────────────────────────────

    public List<FieldDto> getFieldsBySport(String sportId) {
        Sport sport = sportService.getById(sportId);
        return fieldRepository.findBySportId(sportId)
                .stream()
                .map(f -> toDto(f, sport.getSportName()))
                .collect(Collectors.toList());
    }

    // ── Get available fields (optionally filtered by sport) ─────────────────────

    public List<FieldDto> getAvailableFields(String sportId) {
        List<Field> fields = (sportId != null)
                ? fieldRepository.findBySportIdAndIsAvailable(sportId, true)
                : fieldRepository.findByIsAvailable(true);

        return fields.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ── Get by id ───────────────────────────────────────────────────────────────

    public FieldDto getFieldById(String id) {
        Field field = findById(id);
        return toDto(field);
    }

    // ── Update availability ─────────────────────────────────────────────────────

    public FieldDto setAvailability(String id, boolean available) {
        Field field = findById(id);
        field.setAvailable(available);
        Field saved = fieldRepository.save(field);
        return toDto(saved);
    }

    // ── Update field ────────────────────────────────────────────────────────────

    public FieldDto updateField(String id, String name, String sportId, Boolean available) {
        Field field = findById(id);

        if (name != null && !name.isBlank()) field.setName(name);
        if (available != null) field.setAvailable(available);
        if (sportId != null) {
            sportService.getById(sportId); // validate sport exists
            field.setSportId(sportId);
        }

        Field saved = fieldRepository.save(field);
        return toDto(saved);
    }

    // ── Delete ──────────────────────────────────────────────────────────────────

    public void deleteField(String id) {
        if (!fieldRepository.existsById(id)) {
            throw new RuntimeException("Field not found: " + id);
        }
        fieldRepository.deleteById(id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private Field findById(String id) {
        return fieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Field not found: " + id));
    }

    private FieldDto toDto(Field field) {
        String sportName = "–";
        try {
            sportName = sportService.getById(field.getSportId()).getSportName();
        } catch (Exception ignored) {}
        return new FieldDto(field.getId(), field.getName(),
                field.isAvailable(), field.getSportId(), sportName);
    }

    private FieldDto toDto(Field field, String sportName) {
        return new FieldDto(field.getId(), field.getName(),
                field.isAvailable(), field.getSportId(), sportName);
    }
}
