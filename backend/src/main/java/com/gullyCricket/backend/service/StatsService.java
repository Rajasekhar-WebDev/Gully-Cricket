package com.gullyCricket.backend.service;

import com.gullyCricket.backend.dto.DashboardStatsDTO;
import com.gullyCricket.backend.model.Match;
import com.gullyCricket.backend.model.Player;
import com.gullyCricket.backend.repository.MatchRepository;
import com.gullyCricket.backend.repository.PlayerRepository;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsService {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final MongoTemplate mongoTemplate;

    // Fast in-memory cache to make dashboard load instantly (< 1ms)
    private volatile DashboardStatsDTO cachedDashboardStats;
    private volatile long lastDashboardCacheTime = 0;
    private static final long CACHE_TTL_MS = 15000; // 15 seconds cache

    public StatsService(MatchRepository matchRepository,
                        PlayerRepository playerRepository,
                        MongoTemplate mongoTemplate) {
        this.matchRepository = matchRepository;
        this.playerRepository = playerRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public synchronized void invalidateCache() {
        this.cachedDashboardStats = null;
        this.lastDashboardCacheTime = 0;
    }

    public DashboardStatsDTO getDashboardStats() {
        long now = System.currentTimeMillis();
        if (cachedDashboardStats != null && (now - lastDashboardCacheTime) < CACHE_TTL_MS) {
            return cachedDashboardStats;
        }

        DashboardStatsDTO stats = new DashboardStatsDTO();

        long totalMatches = matchRepository.count();
        long completedMatches = matchRepository.countByStatus("COMPLETED");
        long liveMatches = matchRepository.countByStatus("LIVE") + matchRepository.countByStatus("INNINGS_BREAK");
        long upcomingMatches = matchRepository.countByStatus("UPCOMING") + matchRepository.countByStatus("TOSS_DONE");

        stats.setTotalMatches(totalMatches);
        stats.setCompletedMatches(completedMatches);
        stats.setLiveMatches(liveMatches);
        stats.setUpcomingMatches(upcomingMatches);

        // High performance Mongo Aggregation instead of fetching all documents over the network
        int totalRuns = 0;
        int totalWickets = 0;
        try {
            Aggregation agg = Aggregation.newAggregation(
                Aggregation.group()
                    .sum("totalRuns").as("sumRuns")
                    .sum("wickets").as("sumWickets")
            );
            AggregationResults<Document> aggResult = mongoTemplate.aggregate(agg, "scores", Document.class);
            Document doc = aggResult.getUniqueMappedResult();
            if (doc != null) {
                Number r = doc.get("sumRuns", Number.class);
                Number w = doc.get("sumWickets", Number.class);
                totalRuns = r != null ? r.intValue() : 0;
                totalWickets = w != null ? w.intValue() : 0;
            }
        } catch (Exception ignored) {
            // Fallback safe
        }
        stats.setTotalRuns(totalRuns);
        stats.setTotalWickets(totalWickets);

        // Win percentage
        if (totalMatches > 0) {
            double winPct = ((double) completedMatches / totalMatches) * 100.0;
            stats.setWinPercentage(Math.round(winPct * 10.0) / 10.0);
        } else {
            stats.setWinPercentage(0.0);
        }

        // Only query top 5 matches rather than entire database
        List<Match> matches = matchRepository.findTop5ByOrderByCreatedAtDesc();
        stats.setRecentMatches(matches);

        // Only query top 5 upcoming matches
        List<Match> upcoming = matchRepository.findTop5ByStatusOrderByCreatedAtDesc("UPCOMING");
        stats.setUpcomingMatchesList(upcoming);

        // Top batsmen & bowlers (using indexed queries)
        stats.setTopBatsmen(playerRepository.findTop10ByOrderByRunsDesc());
        stats.setTopBowlers(playerRepository.findTop10ByOrderByWicketsDesc());

        this.cachedDashboardStats = stats;
        this.lastDashboardCacheTime = now;

        return stats;
    }

    public Map<String, Object> getLeaderboards() {
        Map<String, Object> result = new HashMap<>();
        List<Player> topBatsmen = playerRepository.findTop10ByOrderByRunsDesc();
        List<Player> topBowlers = playerRepository.findTop10ByOrderByWicketsDesc();

        result.put("orangeCap", topBatsmen.isEmpty() ? null : topBatsmen.get(0));
        result.put("purpleCap", topBowlers.isEmpty() ? null : topBowlers.get(0));
        result.put("topBatsmen", topBatsmen);
        result.put("topBowlers", topBowlers);

        return result;
    }
}
