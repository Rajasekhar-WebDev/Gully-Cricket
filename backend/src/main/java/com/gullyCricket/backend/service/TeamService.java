package com.gullyCricket.backend.service;

import com.gullyCricket.backend.exception.ForbiddenException;
import com.gullyCricket.backend.exception.ResourceNotFoundException;
import com.gullyCricket.backend.model.Player;
import com.gullyCricket.backend.model.Team;
import com.gullyCricket.backend.repository.PlayerRepository;
import com.gullyCricket.backend.repository.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;

    public TeamService(TeamRepository teamRepository, PlayerRepository playerRepository) {
        this.teamRepository = teamRepository;
        this.playerRepository = playerRepository;
    }

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Team getTeamById(String id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
    }

    public Team createTeam(Team team, String userId) {
        team.setOwnerId(userId);
        return teamRepository.save(team);
    }

    public Team updateTeam(String id, Team details, String userId) {
        Team existing = getTeamById(id);
        if (existing.getOwnerId() != null && !existing.getOwnerId().equals(userId)) {
            throw new ForbiddenException("You are not authorized to edit this team.");
        }

        String oldName = existing.getName();
        existing.setName(details.getName() != null ? details.getName() : details.getTeamName());
        existing.setShortCode(details.getShortCode());
        existing.setColor(details.getColor());

        Team saved = teamRepository.save(existing);

        // If team name changed, update corresponding players
        if (oldName != null && !oldName.equalsIgnoreCase(saved.getName())) {
            List<Player> players = playerRepository.findByTeamId(id);
            for (Player p : players) {
                p.setTeamName(saved.getName());
                playerRepository.save(p);
            }
        }

        return saved;
    }

    public void deleteTeam(String id, String userId) {
        Team existing = getTeamById(id);
        if (existing.getOwnerId() != null && !existing.getOwnerId().equals(userId)) {
            throw new ForbiddenException("You are not authorized to delete this team.");
        }

        playerRepository.deleteByTeamId(id);
        teamRepository.delete(existing);
    }

    public List<Player> getTeamPlayers(String teamId) {
        Team team = getTeamById(teamId);
        List<Player> players = playerRepository.findByTeamId(teamId);

        // Fallback migration for existing unlinked players by team name
        if (players.isEmpty() && team.getName() != null) {
            List<Player> legacyPlayers = playerRepository.findByTeamNameIgnoreCase(team.getName());
            if (!legacyPlayers.isEmpty()) {
                for (Player lp : legacyPlayers) {
                    lp.setTeamId(teamId);
                    playerRepository.save(lp);
                }
                return legacyPlayers;
            }
        }

        return players;
    }

    public Player addPlayerToTeam(String teamId, Player player, String userId) {
        Team team = getTeamById(teamId);
        if (team.getOwnerId() != null && !team.getOwnerId().equals(userId)) {
            throw new ForbiddenException("You are not authorized to add players to this team.");
        }

        player.setTeamId(teamId);
        player.setTeamName(team.getName());
        player.recalculateStats();
        Player savedPlayer = playerRepository.save(player);

        if (!team.getPlayerIds().contains(savedPlayer.getId())) {
            team.getPlayerIds().add(savedPlayer.getId());
            teamRepository.save(team);
        }

        return savedPlayer;
    }
}
