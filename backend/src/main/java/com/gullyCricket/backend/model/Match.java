package com.gullyCricket.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "matches")
public class Match {
    @Id
    private String id;
    private String teamA;
    private String teamB;
    private String teamAId;
    private String teamBId;
    @Indexed
    private String createdBy;
    private String createdByName;
    private int totalOvers = 10;
    private String matchDate;
    private String location;
    @Indexed
    private String status = "UPCOMING"; // UPCOMING, TOSS_DONE, LIVE, INNINGS_BREAK, COMPLETED
    private String tossWinner;
    private String tossDecision; // BAT, BOWL
    private String battingTeamFirst;
    private String bowlingTeamFirst;
    private int currentInnings = 1;

    private String winner;
    private Integer winMargin;
    private String winMarginType; // RUNS, WICKETS, TIE
    private String resultDescription;
    private String playerOfTheMatch;

    private List<String> teamAPlayers = new ArrayList<>();
    private List<String> teamBPlayers = new ArrayList<>();
    private List<String> teamAPlayingXI = new ArrayList<>();
    private List<String> teamBPlayingXI = new ArrayList<>();

    // Quick cached summary for listing matches
    private String scoreSummaryTeamA;
    private String scoreSummaryTeamB;

    @Indexed
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Match() {}

    public Match(String teamA, String teamB, int totalOvers, String matchDate, String location) {
        this.teamA = teamA;
        this.teamB = teamB;
        this.totalOvers = totalOvers;
        this.matchDate = matchDate;
        this.location = location;
        this.status = "UPCOMING";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTeamA() { return teamA; }
    public void setTeamA(String teamA) { this.teamA = teamA; }

    public String getTeamB() { return teamB; }
    public void setTeamB(String teamB) { this.teamB = teamB; }

    public int getTotalOvers() { return totalOvers; }
    public void setTotalOvers(int totalOvers) { this.totalOvers = totalOvers; }

    public String getMatchDate() { return matchDate; }
    public void setMatchDate(String matchDate) { this.matchDate = matchDate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTossWinner() { return tossWinner; }
    public void setTossWinner(String tossWinner) { this.tossWinner = tossWinner; }

    public String getTossDecision() { return tossDecision; }
    public void setTossDecision(String tossDecision) { this.tossDecision = tossDecision; }

    public String getBattingTeamFirst() { return battingTeamFirst; }
    public void setBattingTeamFirst(String battingTeamFirst) { this.battingTeamFirst = battingTeamFirst; }

    public String getBowlingTeamFirst() { return bowlingTeamFirst; }
    public void setBowlingTeamFirst(String bowlingTeamFirst) { this.bowlingTeamFirst = bowlingTeamFirst; }

    public int getCurrentInnings() { return currentInnings; }
    public void setCurrentInnings(int currentInnings) { this.currentInnings = currentInnings; }

    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }

    public Integer getWinMargin() { return winMargin; }
    public void setWinMargin(Integer winMargin) { this.winMargin = winMargin; }

    public String getWinMarginType() { return winMarginType; }
    public void setWinMarginType(String winMarginType) { this.winMarginType = winMarginType; }

    public String getResultDescription() { return resultDescription; }
    public void setResultDescription(String resultDescription) { this.resultDescription = resultDescription; }

    public String getPlayerOfTheMatch() { return playerOfTheMatch; }
    public void setPlayerOfTheMatch(String playerOfTheMatch) { this.playerOfTheMatch = playerOfTheMatch; }

    public List<String> getTeamAPlayers() { return teamAPlayers; }
    public void setTeamAPlayers(List<String> teamAPlayers) { this.teamAPlayers = teamAPlayers; }

    public List<String> getTeamBPlayers() { return teamBPlayers; }
    public void setTeamBPlayers(List<String> teamBPlayers) { this.teamBPlayers = teamBPlayers; }

    public List<String> getTeamAPlayingXI() { return teamAPlayingXI; }
    public void setTeamAPlayingXI(List<String> teamAPlayingXI) { this.teamAPlayingXI = teamAPlayingXI; }

    public List<String> getTeamBPlayingXI() { return teamBPlayingXI; }
    public void setTeamBPlayingXI(List<String> teamBPlayingXI) { this.teamBPlayingXI = teamBPlayingXI; }

    public String getScoreSummaryTeamA() { return scoreSummaryTeamA; }
    public void setScoreSummaryTeamA(String scoreSummaryTeamA) { this.scoreSummaryTeamA = scoreSummaryTeamA; }

    public String getScoreSummaryTeamB() { return scoreSummaryTeamB; }
    public void setScoreSummaryTeamB(String scoreSummaryTeamB) { this.scoreSummaryTeamB = scoreSummaryTeamB; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public String getTeamAId() { return teamAId; }
    public void setTeamAId(String teamAId) { this.teamAId = teamAId; }

    public String getTeamBId() { return teamBId; }
    public void setTeamBId(String teamBId) { this.teamBId = teamBId; }

    public String getTeam1Id() { return teamAId; }
    public void setTeam1Id(String team1Id) { this.teamAId = team1Id; }

    public String getTeam2Id() { return teamBId; }
    public void setTeam2Id(String team2Id) { this.teamBId = team2Id; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
