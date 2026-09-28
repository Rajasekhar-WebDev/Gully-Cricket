package com.gullyCricket.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class BallEventDTO {
    private int runsOffBat = 0;
    private String extrasType = "NONE"; // NONE, WIDE, NO_BALL, BYE, LEG_BYE
    private int extraRuns = 0; // e.g. 1 for wide, or 1 + runs

    @JsonProperty("isWicket")
    @JsonAlias({"wicket", "isWicket"})
    private boolean isWicket = false;

    private String dismissalType; // BOWLED, CAUGHT, LBW, RUN_OUT, STUMPED, HIT_WICKET
    private String dismissedBatsmanName;
    private String fielderName;
    private String newBatsmanName;
    private String nextBowlerName;

    public BallEventDTO() {}

    public int getRunsOffBat() { return runsOffBat; }
    public void setRunsOffBat(int runsOffBat) { this.runsOffBat = runsOffBat; }

    public String getExtrasType() { return extrasType; }
    public void setExtrasType(String extrasType) { this.extrasType = extrasType; }

    public int getExtraRuns() { return extraRuns; }
    public void setExtraRuns(int extraRuns) { this.extraRuns = extraRuns; }

    public boolean isWicket() { return isWicket; }
    public boolean getIsWicket() { return isWicket; }
    public void setWicket(boolean wicket) { this.isWicket = wicket; }
    public void setIsWicket(boolean wicket) { this.isWicket = wicket; }

    public String getDismissalType() { return dismissalType; }
    public void setDismissalType(String dismissalType) { this.dismissalType = dismissalType; }

    public String getDismissedBatsmanName() { return dismissedBatsmanName; }
    public void setDismissedBatsmanName(String dismissedBatsmanName) { this.dismissedBatsmanName = dismissedBatsmanName; }

    public String getFielderName() { return fielderName; }
    public void setFielderName(String fielderName) { this.fielderName = fielderName; }

    public String getNewBatsmanName() { return newBatsmanName; }
    public void setNewBatsmanName(String newBatsmanName) { this.newBatsmanName = newBatsmanName; }

    public String getNextBowlerName() { return nextBowlerName; }
    public void setNextBowlerName(String nextBowlerName) { this.nextBowlerName = nextBowlerName; }
}
