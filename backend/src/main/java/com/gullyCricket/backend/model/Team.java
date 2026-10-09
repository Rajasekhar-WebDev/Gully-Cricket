package com.gullyCricket.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "teams")
public class Team {
    @Id
    private String id;
    @Indexed
    private String name;
    private String shortCode;
    private String color = "#10B981";
    @Indexed
    private String ownerId;
    private int matchesPlayed = 0;
    private int matchesWon = 0;
    private int matchesLost = 0;
    private int matchesTied = 0;
    private List<String> playerIds = new ArrayList<>();
    private Instant createdAt = Instant.now();

    public Team() {}

    public Team(String name, String shortCode, String color) {
        this.name = name;
        this.shortCode = shortCode;
        this.color = color;
        this.createdAt = Instant.now();
    }

    public Team(String name, String shortCode, String color, String ownerId) {
        this.name = name;
        this.shortCode = shortCode;
        this.color = color;
        this.ownerId = ownerId;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTeamName() { return name; }
    public void setTeamName(String teamName) { this.name = teamName; }

    public String getShortCode() { return shortCode; }
    public void setShortCode(String shortCode) { this.shortCode = shortCode; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public int getMatchesPlayed() { return matchesPlayed; }
    public void setMatchesPlayed(int matchesPlayed) { this.matchesPlayed = matchesPlayed; }

    public int getMatchesWon() { return matchesWon; }
    public void setMatchesWon(int matchesWon) { this.matchesWon = matchesWon; }

    public int getMatchesLost() { return matchesLost; }
    public void setMatchesLost(int matchesLost) { this.matchesLost = matchesLost; }

    public int getMatchesTied() { return matchesTied; }
    public void setMatchesTied(int matchesTied) { this.matchesTied = matchesTied; }

    public List<String> getPlayerIds() { return playerIds; }
    public void setPlayerIds(List<String> playerIds) { this.playerIds = playerIds; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
