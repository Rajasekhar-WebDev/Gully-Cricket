package com.gullyCricket.backend.controller;

import com.gullyCricket.backend.dto.CreateMatchDTO;
import com.gullyCricket.backend.dto.PlayingXIDTO;
import com.gullyCricket.backend.dto.TossDecisionDTO;
import com.gullyCricket.backend.model.Match;
import com.gullyCricket.backend.service.MatchService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping
    public ResponseEntity<List<Match>> getAllMatches(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(matchService.getMatchesByStatus(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Match> getMatchById(@PathVariable String id) {
        return ResponseEntity.ok(matchService.getMatchById(id));
    }

    @PostMapping
    public ResponseEntity<Match> createMatch(@Valid @RequestBody CreateMatchDTO dto, HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        Match created = matchService.createMatch(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/toss")
    public ResponseEntity<Match> recordToss(@PathVariable String id,
                                            @Valid @RequestBody TossDecisionDTO dto,
                                            HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        Match updated = matchService.recordToss(id, dto, userId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/playing-xi")
    public ResponseEntity<Match> setPlayingXI(@PathVariable String id,
                                              @RequestBody PlayingXIDTO dto,
                                              HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        Match updated = matchService.setPlayingXI(id, dto, userId);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Match> updateStatus(@PathVariable String id,
                                              @RequestBody Map<String, String> body,
                                              HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        String status = body.get("status");
        Match updated = matchService.updateStatus(id, status, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatch(@PathVariable String id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        matchService.deleteMatch(id, userId);
        return ResponseEntity.noContent().build();
    }
}
