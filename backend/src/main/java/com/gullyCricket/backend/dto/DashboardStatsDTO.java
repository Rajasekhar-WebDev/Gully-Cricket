package com.gullyCricket.backend.dto;

import com.gullyCricket.backend.model.Match;
import com.gullyCricket.backend.model.Player;

import java.util.List;

public class DashboardStatsDTO {
    private long totalMatches;
    private long completedMatches;
    private long liveMatches;
    private long upcomingMatches;
    private int totalRuns;
    private int totalWickets;
    private double winPercentage;
    private List<Match> recentMatches;
    private List<Match> upcomingMatchesList;
    private List<Player> topBatsmen;
    private List<Player> topBowlers;

    public DashboardStatsDTO() {}

    public long getTotalMatches() { return totalMatches; }
    public void setTotalMatches(long totalMatches) { this.totalMatches = totalMatches; }

    public long getCompletedMatches() { return completedMatches; }
    public void setCompletedMatches(long completedMatches) { this.completedMatches = completedMatches; }

    public long getLiveMatches() { return liveMatches; }
    public void setLiveMatches(long liveMatches) { this.liveMatches = liveMatches; }

    public long getUpcomingMatches() { return upcomingMatches; }
    public void setUpcomingMatches(long upcomingMatches) { this.upcomingMatches = upcomingMatches; }

    public int getTotalRuns() { return totalRuns; }
    public void setTotalRuns(int totalRuns) { this.totalRuns = totalRuns; }

    public int getTotalWickets() { return totalWickets; }
    public void setTotalWickets(int totalWickets) { this.totalWickets = totalWickets; }

    public double getWinPercentage() { return winPercentage; }
    public void setWinPercentage(double winPercentage) { this.winPercentage = winPercentage; }

    public List<Match> getRecentMatches() { return recentMatches; }
    public void setRecentMatches(List<Match> recentMatches) { this.recentMatches = recentMatches; }

    public List<Match> getUpcomingMatchesList() { return upcomingMatchesList; }
    public void setUpcomingMatchesList(List<Match> upcomingMatchesList) { this.upcomingMatchesList = upcomingMatchesList; }

    public List<Player> getTopBatsmen() { return topBatsmen; }
    public void setTopBatsmen(List<Player> topBatsmen) { this.topBatsmen = topBatsmen; }

    public List<Player> getTopBowlers() { return topBowlers; }
    public void setTopBowlers(List<Player> topBowlers) { this.topBowlers = topBowlers; }
}
