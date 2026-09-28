package com.gullyCricket.backend.controller;

import com.gullyCricket.backend.dto.BallEventDTO;
import com.gullyCricket.backend.dto.MatchScorecardDTO;
import com.gullyCricket.backend.dto.PlayingXIDTO;
import com.gullyCricket.backend.service.ScoringService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/scoring")
public class ScoringController {

    private final ScoringService scoringService;

    public ScoringController(ScoringService scoringService) {
        this.scoringService = scoringService;
    }

    @PostMapping("/{matchId}/ball")
    public ResponseEntity<MatchScorecardDTO> recordBall(@PathVariable String matchId,
                                                        @RequestBody BallEventDTO ballEvent,
                                                        HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        MatchScorecardDTO updated = scoringService.recordBallDelivery(matchId, ballEvent, userId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{matchId}/undo")
    public ResponseEntity<MatchScorecardDTO> undoBall(@PathVariable String matchId,
                                                      HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        MatchScorecardDTO updated = scoringService.undoLastDelivery(matchId, userId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{matchId}/set-bowler")
    public ResponseEntity<MatchScorecardDTO> setBowler(@PathVariable String matchId,
                                                       @RequestBody Map<String, String> payload,
                                                       HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        String bowlerName = payload.get("bowlerName");
        MatchScorecardDTO updated = scoringService.setCurrentBowler(matchId, bowlerName, userId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{matchId}/innings2-setup")
    public ResponseEntity<MatchScorecardDTO> setupInnings2(@PathVariable String matchId,
                                                           @RequestBody(required = false) PlayingXIDTO dto,
                                                           HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        MatchScorecardDTO updated = scoringService.setupInnings2(matchId, dto, userId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{matchId}/swap-strike")
    public ResponseEntity<MatchScorecardDTO> swapStrike(@PathVariable String matchId,
                                                        HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        MatchScorecardDTO updated = scoringService.swapStrikeManual(matchId, userId);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{matchId}/scorecard")
    public ResponseEntity<MatchScorecardDTO> getScorecard(@PathVariable String matchId) {
        MatchScorecardDTO scorecard = scoringService.getScorecard(matchId);
        return ResponseEntity.ok(scorecard);
    }
}
