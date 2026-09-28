package com.gullyCricket.backend.service;

import com.gullyCricket.backend.exception.ForbiddenException;
import com.gullyCricket.backend.exception.ResourceNotFoundException;
import com.gullyCricket.backend.model.Player;
import com.gullyCricket.backend.model.Team;
import com.gullyCricket.backend.repository.PlayerRepository;
import com.gullyCricket.backend.repository.TeamRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;

    public PlayerService(PlayerRepository playerRepository, TeamRepository teamRepository) {
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public Player getPlayerById(String id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + id));
    }

    public List<Player> getPlayersByTeam(String teamName) {
        return playerRepository.findByTeamNameIgnoreCase(teamName);
    }

    public List<Player> getPlayersByTeamId(String teamId) {
        return playerRepository.findByTeamId(teamId);
    }

    public Player createPlayer(Player player, String userId) {
        // Resolve or link team
        if (player.getTeamId() == null && player.getTeamName() != null) {
            Optional<Team> teamOpt = teamRepository.findByNameIgnoreCase(player.getTeamName());
            teamOpt.ifPresent(team -> player.setTeamId(team.getId()));
        }

        if (player.getTeamId() != null) {
            Team team = teamRepository.findById(player.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + player.getTeamId()));
            if (team.getOwnerId() != null && userId != null && !team.getOwnerId().equals(userId)) {
                throw new ForbiddenException("You are not authorized to add players to this team.");
            }
            player.setTeamName(team.getName());
        }

        player.recalculateStats();
        return playerRepository.save(player);
    }

    public Player updatePlayer(String id, Player playerDetails, String userId) {
        Player existing = getPlayerById(id);

        if (existing.getTeamId() != null) {
            Team team = teamRepository.findById(existing.getTeamId()).orElse(null);
            if (team != null && team.getOwnerId() != null && userId != null && !team.getOwnerId().equals(userId)) {
                throw new ForbiddenException("You are not authorized to edit players in this team.");
            }
        }

        existing.setName(playerDetails.getName());
        if (playerDetails.getTeamId() != null) {
            existing.setTeamId(playerDetails.getTeamId());
        }
        if (playerDetails.getTeamName() != null) {
            existing.setTeamName(playerDetails.getTeamName());
        }
        existing.setRole(playerDetails.getRole());
        existing.setMatches(playerDetails.getMatches());
        existing.setRuns(playerDetails.getRuns());
        existing.setWickets(playerDetails.getWickets());
        existing.setBallsFaced(playerDetails.getBallsFaced());
        existing.setFours(playerDetails.getFours());
        existing.setSixes(playerDetails.getSixes());
        existing.setOversBowled(playerDetails.getOversBowled());
        existing.setRunsConceded(playerDetails.getRunsConceded());
        existing.recalculateStats();
        return playerRepository.save(existing);
    }

    public void deletePlayer(String id, String userId) {
        Player player = getPlayerById(id);

        if (player.getTeamId() != null) {
            Team team = teamRepository.findById(player.getTeamId()).orElse(null);
            if (team != null && team.getOwnerId() != null && userId != null && !team.getOwnerId().equals(userId)) {
                throw new ForbiddenException("You are not authorized to delete players in this team.");
            }
        }

        playerRepository.delete(player);
    }

    @PostConstruct
    public void initSeedData() {
        if (playerRepository.count() == 0) {
            // Seed Team A
            Team team1 = teamRepository.findByNameIgnoreCase("Gully Super Kings")
                    .orElseGet(() -> teamRepository.save(new Team("Gully Super Kings", "GSK", "#10B981")));

            saveSeedPlayer("Rohit Sharma (Gully)", team1, "BATSMAN");
            saveSeedPlayer("Virat Kohli (Gully)", team1, "BATSMAN");
            saveSeedPlayer("Suresh Raina (Gully)", team1, "ALL_ROUNDER");
            saveSeedPlayer("MS Dhoni (Gully)", team1, "WICKET_KEEPER");
            saveSeedPlayer("Ravindra Jadeja (Gully)", team1, "ALL_ROUNDER");
            saveSeedPlayer("Jasprit Bumrah (Gully)", team1, "BOWLER");
            saveSeedPlayer("Mohd Shami (Gully)", team1, "BOWLER");

            // Seed Team B
            Team team2 = teamRepository.findByNameIgnoreCase("Street Challengers")
                    .orElseGet(() -> teamRepository.save(new Team("Street Challengers", "STC", "#3B82F6")));

            saveSeedPlayer("KL Rahul (Street)", team2, "BATSMAN");
            saveSeedPlayer("Surya Kumar (Street)", team2, "BATSMAN");
            saveSeedPlayer("Hardik Pandya (Street)", team2, "ALL_ROUNDER");
            saveSeedPlayer("Rishabh Pant (Street)", team2, "WICKET_KEEPER");
            saveSeedPlayer("Axar Patel (Street)", team2, "ALL_ROUNDER");
            saveSeedPlayer("Kuldeep Yadav (Street)", team2, "BOWLER");
            saveSeedPlayer("Siraj (Street)", team2, "BOWLER");

            // Seed sample stats for leaderboards
            List<Player> players = playerRepository.findAll();
            for (int i = 0; i < players.size(); i++) {
                Player p = players.get(i);
                p.setMatches(5 + (i % 4));
                if ("BATSMAN".equals(p.getRole()) || "ALL_ROUNDER".equals(p.getRole())) {
                    p.setRuns(120 + (i * 35));
                    p.setBallsFaced(70 + (i * 20));
                    p.setFours(12 + i * 2);
                    p.setSixes(6 + i);
                    p.setHighestScore(65 + i * 3);
                }
                if ("BOWLER".equals(p.getRole()) || "ALL_ROUNDER".equals(p.getRole())) {
                    p.setWickets(6 + (i * 2));
                    p.setOversBowled(14.0 + i);
                    p.setRunsConceded(95 + (i * 10));
                    p.setDots(30 + i * 5);
                }
                p.recalculateStats();
                playerRepository.save(p);
            }
        } else {
            // Migration: link existing players that may lack teamId
            List<Player> existingPlayers = playerRepository.findAll();
            for (Player p : existingPlayers) {
                if ((p.getTeamId() == null || p.getTeamId().isBlank()) && p.getTeamName() != null) {
                    teamRepository.findByNameIgnoreCase(p.getTeamName()).ifPresent(t -> {
                        p.setTeamId(t.getId());
                        playerRepository.save(p);
                    });
                }
            }
        }
    }

    private void saveSeedPlayer(String name, Team team, String role) {
        Player p = new Player(name, team.getId(), team.getName(), role);
        playerRepository.save(p);
    }
}
