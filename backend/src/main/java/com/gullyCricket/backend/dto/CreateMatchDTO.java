package com.gullyCricket.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateMatchDTO {
    @NotBlank(message = "Team A name is required")
    private String teamA;

    @NotBlank(message = "Team B name is required")
    private String teamB;

    private String teamAId;
    private String teamBId;

    @NotNull(message = "Number of overs is required")
    @Min(value = 1, message = "Overs must be at least 1")
    private Integer totalOvers;

    @NotBlank(message = "Match date is required")
    private String matchDate;

    @NotBlank(message = "Match location is required")
    private String location;

    public CreateMatchDTO() {}

    public String getTeamA() { return teamA; }
    public void setTeamA(String teamA) { this.teamA = teamA; }

    public String getTeamB() { return teamB; }
    public void setTeamB(String teamB) { this.teamB = teamB; }

    public String getTeamAId() { return teamAId; }
    public void setTeamAId(String teamAId) { this.teamAId = teamAId; }

    public String getTeamBId() { return teamBId; }
    public void setTeamBId(String teamBId) { this.teamBId = teamBId; }

    public String getTeam1Id() { return teamAId; }
    public void setTeam1Id(String team1Id) { this.teamAId = team1Id; }

    public String getTeam2Id() { return teamBId; }
    public void setTeam2Id(String team2Id) { this.teamBId = team2Id; }

    public Integer getTotalOvers() { return totalOvers; }
    public void setTotalOvers(Integer totalOvers) { this.totalOvers = totalOvers; }

    public String getMatchDate() { return matchDate; }
    public void setMatchDate(String matchDate) { this.matchDate = matchDate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
