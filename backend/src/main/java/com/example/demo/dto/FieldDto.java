package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FieldDto {
    private String id;
    private String name;
    private boolean isAvailable;
    private String sportId;
    private String sportName;
}
