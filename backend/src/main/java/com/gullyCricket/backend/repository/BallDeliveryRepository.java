package com.gullyCricket.backend.repository;

import com.gullyCricket.backend.model.BallDelivery;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BallDeliveryRepository extends MongoRepository<BallDelivery, String> {
    List<BallDelivery> findByMatchIdAndInningsNumberOrderByTimestampAsc(String matchId, int inningsNumber);
    List<BallDelivery> findByMatchIdOrderByTimestampAsc(String matchId);
    Optional<BallDelivery> findTopByMatchIdAndInningsNumberOrderByTimestampDesc(String matchId, int inningsNumber);
    void deleteByMatchId(String matchId);
}
