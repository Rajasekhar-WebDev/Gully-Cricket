package com.gullyCricket.backend.repository;

import com.gullyCricket.backend.model.Match;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends MongoRepository<Match, String> {
    List<Match> findAllByOrderByCreatedAtDesc();
    List<Match> findByStatusOrderByCreatedAtDesc(String status);
    long countByStatus(String status);
}
