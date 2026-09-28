package com.gullyCricket.backend.controller;

import com.gullyCricket.backend.model.Player;
import com.gullyCricket.backend.model.Team;
import com.gullyCricket.backend.service.TeamService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public ResponseEntity<List<Team>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable String id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @PostMapping
    public ResponseEntity<Team> createTeam(@RequestBody Team team, HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        Team created = teamService.createTeam(team, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Team> updateTeam(@PathVariable String id,
                                           @RequestBody Team team,
                                           HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        Team updated = teamService.updateTeam(id, team, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable String id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        teamService.deleteTeam(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{teamId}/players")
    public ResponseEntity<List<Player>> getTeamPlayers(@PathVariable String teamId) {
        return ResponseEntity.ok(teamService.getTeamPlayers(teamId));
    }

    @PostMapping("/{teamId}/players")
    public ResponseEntity<Player> addTeamPlayer(@PathVariable String teamId,
                                                @RequestBody Player player,
                                                HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        Player created = teamService.addPlayerToTeam(teamId, player, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
