package com.gullyCricket.backend.model;

public class BowlerStats {
    private String playerId;
    private String playerName;
    private int completedOvers = 0;
    private int ballsInCurrentOver = 0;
    private int maidens = 0;
    private int runsConceded = 0;
    private int wickets = 0;
    private int dots = 0;
    private int wides = 0;
    private int noBalls = 0;
    private double economy = 0.0;
    private boolean isCurrentBowler = false;

    public BowlerStats() {}

    public BowlerStats(String playerId, String playerName) {
        this.playerId = playerId;
        this.playerName = playerName;
    }

    public String getOversDisplay() {
        return completedOvers + "." + ballsInCurrentOver;
    }

    public double getTotalOversDecimal() {
        return completedOvers + (ballsInCurrentOver / 6.0);
    }

    public void updateEconomy() {
        double oversDec = getTotalOversDecimal();
        if (oversDec > 0) {
            this.economy = Math.round(((double) runsConceded / oversDec) * 100.0) / 100.0;
        } else {
            this.economy = 0.0;
        }
    }

    // Getters and Setters
    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public int getCompletedOvers() { return completedOvers; }
    public void setCompletedOvers(int completedOvers) { this.completedOvers = completedOvers; }

    public int getBallsInCurrentOver() { return ballsInCurrentOver; }
    public void setBallsInCurrentOver(int ballsInCurrentOver) { this.ballsInCurrentOver = ballsInCurrentOver; }

    public int getMaidens() { return maidens; }
    public void setMaidens(int maidens) { this.maidens = maidens; }

    public int getRunsConceded() { return runsConceded; }
    public void setRunsConceded(int runsConceded) { this.runsConceded = runsConceded; }

    public int getWickets() { return wickets; }
    public void setWickets(int wickets) { this.wickets = wickets; }

    public int getDots() { return dots; }
    public void setDots(int dots) { this.dots = dots; }

    public int getWides() { return wides; }
    public void setWides(int wides) { this.wides = wides; }

    public int getNoBalls() { return noBalls; }
    public void setNoBalls(int noBalls) { this.noBalls = noBalls; }

    public double getEconomy() { return economy; }
    public void setEconomy(double economy) { this.economy = economy; }

    public boolean isCurrentBowler() { return isCurrentBowler; }
    public void setCurrentBowler(boolean currentBowler) { isCurrentBowler = currentBowler; }
}
