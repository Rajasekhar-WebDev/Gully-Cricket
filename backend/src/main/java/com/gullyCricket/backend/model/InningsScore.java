package com.gullyCricket.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "scores")
public class InningsScore {
    @Id
    private String id;
    private String matchId;
    private int inningsNumber; // 1 or 2
    private String battingTeam;
    private String bowlingTeam;
    private int totalRuns = 0;
    private int wickets = 0;
    private int completedOvers = 0;
    private int ballsInCurrentOver = 0;
    private Extras extras = new Extras();
    private boolean isCompleted = false;
    private Integer targetRuns; // for 2nd innings
    private String currentStrikerId;
    private String currentStrikerName;
    private String currentNonStrikerId;
    private String currentNonStrikerName;
    private String currentBowlerId;
    private String currentBowlerName;

    private List<BatsmanStats> battingStats = new ArrayList<>();
    private List<BowlerStats> bowlingStats = new ArrayList<>();
    private List<WicketDetail> fallOfWickets = new ArrayList<>();

    public InningsScore() {}

    public InningsScore(String matchId, int inningsNumber, String battingTeam, String bowlingTeam) {
        this.matchId = matchId;
        this.inningsNumber = inningsNumber;
        this.battingTeam = battingTeam;
        this.bowlingTeam = bowlingTeam;
    }

    public String getOversDisplay() {
        return completedOvers + "." + ballsInCurrentOver;
    }

    public double getRunRate() {
        double totalOversDecimal = completedOvers + (ballsInCurrentOver / 6.0);
        if (totalOversDecimal > 0) {
            return Math.round(((double) totalRuns / totalOversDecimal) * 100.0) / 100.0;
        }
        return 0.0;
    }

    public Double getRequiredRunRate(int maxOvers) {
        if (targetRuns == null || isCompleted) return null;
        int remainingRuns = targetRuns - totalRuns;
        int remainingBalls = (maxOvers * 6) - ((completedOvers * 6) + ballsInCurrentOver);
        if (remainingBalls <= 0) return 0.0;
        double remainingOvers = remainingBalls / 6.0;
        return Math.round(((double) remainingRuns / remainingOvers) * 100.0) / 100.0;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMatchId() { return matchId; }
    public void setMatchId(String matchId) { this.matchId = matchId; }

    public int getInningsNumber() { return inningsNumber; }
    public void setInningsNumber(int inningsNumber) { this.inningsNumber = inningsNumber; }

    public String getBattingTeam() { return battingTeam; }
    public void setBattingTeam(String battingTeam) { this.battingTeam = battingTeam; }

    public String getBowlingTeam() { return bowlingTeam; }
    public void setBowlingTeam(String bowlingTeam) { this.bowlingTeam = bowlingTeam; }

    public int getTotalRuns() { return totalRuns; }
    public void setTotalRuns(int totalRuns) { this.totalRuns = totalRuns; }

    public int getWickets() { return wickets; }
    public void setWickets(int wickets) { this.wickets = wickets; }

    public int getCompletedOvers() { return completedOvers; }
    public void setCompletedOvers(int completedOvers) { this.completedOvers = completedOvers; }

    public int getBallsInCurrentOver() { return ballsInCurrentOver; }
    public void setBallsInCurrentOver(int ballsInCurrentOver) { this.ballsInCurrentOver = ballsInCurrentOver; }

    public Extras getExtras() { return extras; }
    public void setExtras(Extras extras) { this.extras = extras; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public Integer getTargetRuns() { return targetRuns; }
    public void setTargetRuns(Integer targetRuns) { this.targetRuns = targetRuns; }

    public String getCurrentStrikerId() { return currentStrikerId; }
    public void setCurrentStrikerId(String currentStrikerId) { this.currentStrikerId = currentStrikerId; }

    public String getCurrentStrikerName() { return currentStrikerName; }
    public void setCurrentStrikerName(String currentStrikerName) { this.currentStrikerName = currentStrikerName; }

    public String getCurrentNonStrikerId() { return currentNonStrikerId; }
    public void setCurrentNonStrikerId(String currentNonStrikerId) { this.currentNonStrikerId = currentNonStrikerId; }

    public String getCurrentNonStrikerName() { return currentNonStrikerName; }
    public void setCurrentNonStrikerName(String currentNonStrikerName) { this.currentNonStrikerName = currentNonStrikerName; }

    public String getCurrentBowlerId() { return currentBowlerId; }
    public void setCurrentBowlerId(String currentBowlerId) { this.currentBowlerId = currentBowlerId; }

    public String getCurrentBowlerName() { return currentBowlerName; }
    public void setCurrentBowlerName(String currentBowlerName) { this.currentBowlerName = currentBowlerName; }

    public List<BatsmanStats> getBattingStats() { return battingStats; }
    public void setBattingStats(List<BatsmanStats> battingStats) { this.battingStats = battingStats; }

    public List<BowlerStats> getBowlingStats() { return bowlingStats; }
    public void setBowlingStats(List<BowlerStats> bowlingStats) { this.bowlingStats = bowlingStats; }

    public List<WicketDetail> getFallOfWickets() { return fallOfWickets; }
    public void setFallOfWickets(List<WicketDetail> fallOfWickets) { this.fallOfWickets = fallOfWickets; }
}
