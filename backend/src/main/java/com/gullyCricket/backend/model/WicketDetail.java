package com.gullyCricket.backend.model;

public class WicketDetail {
    private int wicketNumber;
    private String batsmanName;
    private int scoreAtDismissal;
    private String overAtDismissal;
    private String dismissalType; // BOWLED, CAUGHT, LBW, RUN_OUT, STUMPED, HIT_WICKET
    private String bowlerName;
    private String fielderName;

    public WicketDetail() {}

    public WicketDetail(int wicketNumber, String batsmanName, int scoreAtDismissal, String overAtDismissal, String dismissalType, String bowlerName, String fielderName) {
        this.wicketNumber = wicketNumber;
        this.batsmanName = batsmanName;
        this.scoreAtDismissal = scoreAtDismissal;
        this.overAtDismissal = overAtDismissal;
        this.dismissalType = dismissalType;
        this.bowlerName = bowlerName;
        this.fielderName = fielderName;
    }

    public int getWicketNumber() { return wicketNumber; }
    public void setWicketNumber(int wicketNumber) { this.wicketNumber = wicketNumber; }

    public String getBatsmanName() { return batsmanName; }
    public void setBatsmanName(String batsmanName) { this.batsmanName = batsmanName; }

    public int getScoreAtDismissal() { return scoreAtDismissal; }
    public void setScoreAtDismissal(int scoreAtDismissal) { this.scoreAtDismissal = scoreAtDismissal; }

    public String getOverAtDismissal() { return overAtDismissal; }
    public void setOverAtDismissal(String overAtDismissal) { this.overAtDismissal = overAtDismissal; }

    public String getDismissalType() { return dismissalType; }
    public void setDismissalType(String dismissalType) { this.dismissalType = dismissalType; }

    public String getBowlerName() { return bowlerName; }
    public void setBowlerName(String bowlerName) { this.bowlerName = bowlerName; }

    public String getFielderName() { return fielderName; }
    public void setFielderName(String fielderName) { this.fielderName = fielderName; }
}
