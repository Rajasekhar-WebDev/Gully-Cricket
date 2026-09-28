package com.gullyCricket.backend.dto;

import com.gullyCricket.backend.model.BallDelivery;
import com.gullyCricket.backend.model.InningsScore;
import com.gullyCricket.backend.model.Match;

import java.util.ArrayList;
import java.util.List;

public class MatchScorecardDTO {
    private Match match;
    private InningsScore firstInnings;
    private InningsScore secondInnings;
    private InningsScore currentInnings;
    private List<BallDelivery> recentBalls = new ArrayList<>();
    private List<BallDelivery> currentOverBalls = new ArrayList<>();

    public MatchScorecardDTO() {}

    public MatchScorecardDTO(Match match, InningsScore firstInnings, InningsScore secondInnings, InningsScore currentInnings) {
        this.match = match;
        this.firstInnings = firstInnings;
        this.secondInnings = secondInnings;
        this.currentInnings = currentInnings;
    }

    public Match getMatch() { return match; }
    public void setMatch(Match match) { this.match = match; }

    public InningsScore getFirstInnings() { return firstInnings; }
    public void setFirstInnings(InningsScore firstInnings) { this.firstInnings = firstInnings; }

    public InningsScore getSecondInnings() { return secondInnings; }
    public void setSecondInnings(InningsScore secondInnings) { this.secondInnings = secondInnings; }

    public InningsScore getCurrentInnings() { return currentInnings; }
    public void setCurrentInnings(InningsScore currentInnings) { this.currentInnings = currentInnings; }

    public List<BallDelivery> getRecentBalls() { return recentBalls; }
    public void setRecentBalls(List<BallDelivery> recentBalls) { this.recentBalls = recentBalls; }

    public List<BallDelivery> getCurrentOverBalls() { return currentOverBalls; }
    public void setCurrentOverBalls(List<BallDelivery> currentOverBalls) { this.currentOverBalls = currentOverBalls; }
}
