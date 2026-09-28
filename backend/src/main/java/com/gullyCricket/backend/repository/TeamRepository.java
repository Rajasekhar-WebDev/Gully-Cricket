package com.gullyCricket.backend.repository;

import com.gullyCricket.backend.model.Team;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends MongoRepository<Team, String> {
    Optional<Team> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Team> findByOwnerId(String ownerId);
}
