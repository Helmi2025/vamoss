package com.example.demo.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_threads")
public class ChatThread {

    @Id
    private String id;

    private Type type;

    private List<String> participants = new ArrayList<>();

    /** Set for GROUP threads — references the team. */
    private String teamId;

    private LocalDateTime lastMessageAt;

    public enum Type {
        GROUP, PRIVATE
    }
}
