package com.gullyCricket.backend.controller;

import com.gullyCricket.backend.model.Player;
import com.gullyCricket.backend.service.PlayerService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<List<Player>> getAllPlayers(@RequestParam(required = false) String team,
                                                      @RequestParam(required = false) String teamId) {
        if (teamId != null && !teamId.isBlank()) {
            return ResponseEntity.ok(playerService.getPlayersByTeamId(teamId));
        }
        if (team != null && !team.isBlank()) {
            return ResponseEntity.ok(playerService.getPlayersByTeam(team));
        }
        return ResponseEntity.ok(playerService.getAllPlayers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Player> getPlayerById(@PathVariable String id) {
        return ResponseEntity.ok(playerService.getPlayerById(id));
    }

    @GetMapping("/team/{teamName}")
    public ResponseEntity<List<Player>> getPlayersByTeam(@PathVariable String teamName) {
        return ResponseEntity.ok(playerService.getPlayersByTeam(teamName));
    }

    @PostMapping
    public ResponseEntity<Player> createPlayer(@RequestBody Player player, HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        Player created = playerService.createPlayer(player, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Player> updatePlayer(@PathVariable String id,
                                               @RequestBody Player player,
                                               HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        Player updated = playerService.updatePlayer(id, player, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable String id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("authenticatedUserId");
        playerService.deletePlayer(id, userId);
        return ResponseEntity.noContent().build();
    }
}
