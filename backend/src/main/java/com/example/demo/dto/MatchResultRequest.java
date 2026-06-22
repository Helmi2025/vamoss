package com.example.demo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchResultRequest {

    @Min(value = 0, message = "Score 1 must be at least 0")
    @Max(value = 999, message = "Score 1 must be at most 999")
    private int score1;

    @Min(value = 0, message = "Score 2 must be at least 0")
    @Max(value = 999, message = "Score 2 must be at most 999")
    private int score2;
}
