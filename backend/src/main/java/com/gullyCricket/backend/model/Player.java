package com.gullyCricket.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "players")
public class Player {
    @Id
    private String id;
    private String name;
    private String teamId;
    private String teamName;
    private String role; // "BATSMAN", "BOWLER", "ALL_ROUNDER", "WICKET_KEEPER"
    private int matches = 0;
    private int runs = 0;
    private int ballsFaced = 0;
    private int highestScore = 0;
    private int fours = 0;
    private int sixes = 0;
    private int wickets = 0;
    private double oversBowled = 0.0;
    private int runsConceded = 0;
    private int dots = 0;
    private int maidens = 0;
    private double battingAverage = 0.0;
    private double battingStrikeRate = 0.0;
    private double bowlingEconomy = 0.0;
    private Instant createdAt = Instant.now();

    public Player() {}

    public Player(String name, String teamName, String role) {
        this.name = name;
        this.teamName = teamName;
        this.role = role;
        this.createdAt = Instant.now();
    }

    public Player(String name, String teamId, String teamName, String role) {
        this.name = name;
        this.teamId = teamId;
        this.teamName = teamName;
        this.role = role;
        this.createdAt = Instant.now();
    }

    public void recalculateStats() {
        if (ballsFaced > 0) {
            this.battingStrikeRate = Math.round(((double) runs / ballsFaced) * 10000.0) / 100.0;
        } else {
            this.battingStrikeRate = 0.0;
        }
        if (matches > 0) {
            this.battingAverage = Math.round(((double) runs / matches) * 100.0) / 100.0;
        }
        if (oversBowled > 0) {
            this.bowlingEconomy = Math.round(((double) runsConceded / oversBowled) * 100.0) / 100.0;
        }
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public int getMatches() { return matches; }
    public void setMatches(int matches) { this.matches = matches; }

    public int getRuns() { return runs; }
    public void setRuns(int runs) { this.runs = runs; }

    public int getBallsFaced() { return ballsFaced; }
    public void setBallsFaced(int ballsFaced) { this.ballsFaced = ballsFaced; }

    public int getHighestScore() { return highestScore; }
    public void setHighestScore(int highestScore) { this.highestScore = highestScore; }

    public int getFours() { return fours; }
    public void setFours(int fours) { this.fours = fours; }

    public int getSixes() { return sixes; }
    public void setSixes(int sixes) { this.sixes = sixes; }

    public int getWickets() { return wickets; }
    public void setWickets(int wickets) { this.wickets = wickets; }

    public double getOversBowled() { return oversBowled; }
    public void setOversBowled(double oversBowled) { this.oversBowled = oversBowled; }

    public int getRunsConceded() { return runsConceded; }
    public void setRunsConceded(int runsConceded) { this.runsConceded = runsConceded; }

    public int getDots() { return dots; }
    public void setDots(int dots) { this.dots = dots; }

    public int getMaidens() { return maidens; }
    public void setMaidens(int maidens) { this.maidens = maidens; }

    public double getBattingAverage() { return battingAverage; }
    public void setBattingAverage(double battingAverage) { this.battingAverage = battingAverage; }

    public double getBattingStrikeRate() { return battingStrikeRate; }
    public void setBattingStrikeRate(double battingStrikeRate) { this.battingStrikeRate = battingStrikeRate; }

    public double getBowlingEconomy() { return bowlingEconomy; }
    public void setBowlingEconomy(double bowlingEconomy) { this.bowlingEconomy = bowlingEconomy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
