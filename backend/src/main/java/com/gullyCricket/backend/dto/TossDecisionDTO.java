package com.gullyCricket.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class TossDecisionDTO {
    private String tossCaller;
    private String tossCall; // HEADS or TAILS
    private String coinResult; // HEADS or TAILS


    private String tossWinner;


    private String tossDecision; // BAT or BOWL

    public TossDecisionDTO() {}

    public String getTossCaller() { return tossCaller; }
    public void setTossCaller(String tossCaller) { this.tossCaller = tossCaller; }

    public String getTossCall() { return tossCall; }
    public void setTossCall(String tossCall) { this.tossCall = tossCall; }

    public String getCoinResult() { return coinResult; }
    public void setCoinResult(String coinResult) { this.coinResult = coinResult; }

    public String getTossWinner() { return tossWinner; }
    public void setTossWinner(String tossWinner) { this.tossWinner = tossWinner; }

    public String getTossDecision() { return tossDecision; }
    public void setTossDecision(String tossDecision) { this.tossDecision = tossDecision; }
}
