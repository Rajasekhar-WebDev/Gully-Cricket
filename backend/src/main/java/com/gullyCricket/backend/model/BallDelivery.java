package com.gullyCricket.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "balls")
public class BallDelivery {
    @Id
    private String id;
    private String matchId;
    private int inningsNumber;
    private int overNumber; // 1-based
    private int ballNumberInOver; // 1-based legal ball
    private String ballDisplay; // e.g. "0.1", "1.4"
    private String batsmanId;
    private String batsmanName;
    private String nonStrikerId;
    private String nonStrikerName;
    private String bowlerId;
    private String bowlerName;
    private int runsOffBat = 0;
    private String extrasType = "NONE"; // NONE, WIDE, NO_BALL, BYE, LEG_BYE
    private int extraRuns = 0;
    private int totalRuns = 0;
    private boolean isLegalDelivery = true;
    private boolean isWicket = false;
    private String dismissalType; // BOWLED, CAUGHT, LBW, RUN_OUT, STUMPED, HIT_WICKET
    private String dismissedPlayerName;
    private String fielderName;
    private String commentary;
    private String scoreAtBall; // e.g. "45/2"
    private Instant timestamp = Instant.now();

    public BallDelivery() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMatchId() { return matchId; }
    public void setMatchId(String matchId) { this.matchId = matchId; }

    public int getInningsNumber() { return inningsNumber; }
    public void setInningsNumber(int inningsNumber) { this.inningsNumber = inningsNumber; }

    public int getOverNumber() { return overNumber; }
    public void setOverNumber(int overNumber) { this.overNumber = overNumber; }

    public int getBallNumberInOver() { return ballNumberInOver; }
    public void setBallNumberInOver(int ballNumberInOver) { this.ballNumberInOver = ballNumberInOver; }

    public String getBallDisplay() { return ballDisplay; }
    public void setBallDisplay(String ballDisplay) { this.ballDisplay = ballDisplay; }

    public String getBatsmanId() { return batsmanId; }
    public void setBatsmanId(String batsmanId) { this.batsmanId = batsmanId; }

    public String getBatsmanName() { return batsmanName; }
    public void setBatsmanName(String batsmanName) { this.batsmanName = batsmanName; }

    public String getNonStrikerId() { return nonStrikerId; }
    public void setNonStrikerId(String nonStrikerId) { this.nonStrikerId = nonStrikerId; }

    public String getNonStrikerName() { return nonStrikerName; }
    public void setNonStrikerName(String nonStrikerName) { this.nonStrikerName = nonStrikerName; }

    public String getBowlerId() { return bowlerId; }
    public void setBowlerId(String bowlerId) { this.bowlerId = bowlerId; }

    public String getBowlerName() { return bowlerName; }
    public void setBowlerName(String bowlerName) { this.bowlerName = bowlerName; }

    public int getRunsOffBat() { return runsOffBat; }
    public void setRunsOffBat(int runsOffBat) { this.runsOffBat = runsOffBat; }

    public String getExtrasType() { return extrasType; }
    public void setExtrasType(String extrasType) { this.extrasType = extrasType; }

    public int getExtraRuns() { return extraRuns; }
    public void setExtraRuns(int extraRuns) { this.extraRuns = extraRuns; }

    public int getTotalRuns() { return totalRuns; }
    public void setTotalRuns(int totalRuns) { this.totalRuns = totalRuns; }

    public boolean isLegalDelivery() { return isLegalDelivery; }
    public void setLegalDelivery(boolean legalDelivery) { isLegalDelivery = legalDelivery; }

    public boolean isWicket() { return isWicket; }
    public void setWicket(boolean wicket) { isWicket = wicket; }

    public String getDismissalType() { return dismissalType; }
    public void setDismissalType(String dismissalType) { this.dismissalType = dismissalType; }

    public String getDismissedPlayerName() { return dismissedPlayerName; }
    public void setDismissedPlayerName(String dismissedPlayerName) { this.dismissedPlayerName = dismissedPlayerName; }

    public String getFielderName() { return fielderName; }
    public void setFielderName(String fielderName) { this.fielderName = fielderName; }

    public String getCommentary() { return commentary; }
    public void setCommentary(String commentary) { this.commentary = commentary; }

    public String getScoreAtBall() { return scoreAtBall; }
    public void setScoreAtBall(String scoreAtBall) { this.scoreAtBall = scoreAtBall; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
