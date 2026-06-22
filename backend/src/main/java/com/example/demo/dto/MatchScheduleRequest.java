package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchScheduleRequest {

    @NotNull(message = "Scheduled date/time is required")
    private LocalDateTime scheduledDateTime;

    @NotBlank(message = "Field ID is required")
    private String fieldId;
}
