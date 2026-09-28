package com.gullyCricket.backend.repository;

import com.gullyCricket.backend.model.InningsScore;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InningsScoreRepository extends MongoRepository<InningsScore, String> {
    List<InningsScore> findByMatchIdOrderByInningsNumberAsc(String matchId);
    Optional<InningsScore> findByMatchIdAndInningsNumber(String matchId, int inningsNumber);
    void deleteByMatchId(String matchId);
}
