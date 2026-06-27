package com.example.demo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BracketSwapRequest {
    
    @NotBlank(message = "Match 1 ID is required")
    private String match1Id;
    
    @NotBlank(message = "Match 2 ID is required")
    private String match2Id;
    
    /**
     * Position to swap: 1 for participant1, 2 for participant2
     */
    @Min(value = 1, message = "Position must be 1 or 2")
    @Max(value = 2, message = "Position must be 1 or 2")
    private int match1Position;
    
    /**
     * Position to swap: 1 for participant1, 2 for participant2
     */
    @Min(value = 1, message = "Position must be 1 or 2")
    @Max(value = 2, message = "Position must be 1 or 2")
    private int match2Position;
}
