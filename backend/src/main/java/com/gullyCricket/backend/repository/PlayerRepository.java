package com.gullyCricket.backend.repository;

import com.gullyCricket.backend.model.Player;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends MongoRepository<Player, String> {
    List<Player> findByTeamNameIgnoreCase(String teamName);
    List<Player> findByTeamId(String teamId);
    void deleteByTeamId(String teamId);
    List<Player> findByRole(String role);
    List<Player> findTop10ByOrderByRunsDesc();
    List<Player> findTop10ByOrderByWicketsDesc();
}
