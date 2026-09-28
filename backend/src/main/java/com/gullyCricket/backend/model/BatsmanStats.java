package com.gullyCricket.backend.model;

public class BatsmanStats {
    private String playerId;
    private String playerName;
    private int runs = 0;
    private int balls = 0;
    private int fours = 0;
    private int sixes = 0;
    private double strikeRate = 0.0;
    private boolean isOut = false;
    private String dismissalInfo = "not out";
    private String bowlerName;
    private String fielderName;
    private int battingOrder = 0;
    private boolean isOnStrike = false;

    public BatsmanStats() {}

    public BatsmanStats(String playerId, String playerName, int battingOrder) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.battingOrder = battingOrder;
        this.isOut = false;
        this.dismissalInfo = "not out";
    }

    public void updateStrikeRate() {
        if (balls > 0) {
            this.strikeRate = Math.round(((double) runs / balls) * 10000.0) / 100.0;
        } else {
            this.strikeRate = 0.0;
        }
    }

    // Getters and Setters
    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public int getRuns() { return runs; }
    public void setRuns(int runs) { this.runs = runs; }

    public int getBalls() { return balls; }
    public void setBalls(int balls) { this.balls = balls; }

    public int getFours() { return fours; }
    public void setFours(int fours) { this.fours = fours; }

    public int getSixes() { return sixes; }
    public void setSixes(int sixes) { this.sixes = sixes; }

    public double getStrikeRate() { return strikeRate; }
    public void setStrikeRate(double strikeRate) { this.strikeRate = strikeRate; }

    public boolean isOut() { return isOut; }
    public void setOut(boolean out) { isOut = out; }

    public String getDismissalInfo() { return dismissalInfo; }
    public void setDismissalInfo(String dismissalInfo) { this.dismissalInfo = dismissalInfo; }

    public String getBowlerName() { return bowlerName; }
    public void setBowlerName(String bowlerName) { this.bowlerName = bowlerName; }

    public String getFielderName() { return fielderName; }
    public void setFielderName(String fielderName) { this.fielderName = fielderName; }

    public int getBattingOrder() { return battingOrder; }
    public void setBattingOrder(int battingOrder) { this.battingOrder = battingOrder; }

    public boolean isOnStrike() { return isOnStrike; }
    public void setOnStrike(boolean onStrike) { isOnStrike = onStrike; }
}
