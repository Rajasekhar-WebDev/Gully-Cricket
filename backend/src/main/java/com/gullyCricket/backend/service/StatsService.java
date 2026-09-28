package com.gullyCricket.backend.service;

import com.gullyCricket.backend.dto.DashboardStatsDTO;
import com.gullyCricket.backend.model.InningsScore;
import com.gullyCricket.backend.model.Match;
import com.gullyCricket.backend.model.Player;
import com.gullyCricket.backend.repository.InningsScoreRepository;
import com.gullyCricket.backend.repository.MatchRepository;
import com.gullyCricket.backend.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsService {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final InningsScoreRepository inningsScoreRepository;

    public StatsService(MatchRepository matchRepository,
                        PlayerRepository playerRepository,
                        InningsScoreRepository inningsScoreRepository) {
        this.matchRepository = matchRepository;
        this.playerRepository = playerRepository;
        this.inningsScoreRepository = inningsScoreRepository;
    }

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        long totalMatches = matchRepository.count();
        long completedMatches = matchRepository.countByStatus("COMPLETED");
        long liveMatches = matchRepository.countByStatus("LIVE") + matchRepository.countByStatus("INNINGS_BREAK");
        long upcomingMatches = matchRepository.countByStatus("UPCOMING") + matchRepository.countByStatus("TOSS_DONE");

        stats.setTotalMatches(totalMatches);
        stats.setCompletedMatches(completedMatches);
        stats.setLiveMatches(liveMatches);
        stats.setUpcomingMatches(upcomingMatches);

        // Sum runs and wickets across all innings
        List<InningsScore> allInnings = inningsScoreRepository.findAll();
        int totalRuns = allInnings.stream().mapToInt(InningsScore::getTotalRuns).sum();
        int totalWickets = allInnings.stream().mapToInt(InningsScore::getWickets).sum();
        stats.setTotalRuns(totalRuns);
        stats.setTotalWickets(totalWickets);

        // Calculate win percentage
        if (totalMatches > 0) {
            double winPct = ((double) completedMatches / totalMatches) * 100.0;
            stats.setWinPercentage(Math.round(winPct * 10.0) / 10.0);
        } else {
            stats.setWinPercentage(0.0);
        }

        // Recent matches
        List<Match> matches = matchRepository.findAllByOrderByCreatedAtDesc();
        stats.setRecentMatches(matches.subList(0, Math.min(5, matches.size())));

        // Upcoming matches
        List<Match> upcoming = matchRepository.findByStatusOrderByCreatedAtDesc("UPCOMING");
        stats.setUpcomingMatchesList(upcoming.subList(0, Math.min(5, upcoming.size())));

        // Top batsmen & bowlers
        stats.setTopBatsmen(playerRepository.findTop10ByOrderByRunsDesc());
        stats.setTopBowlers(playerRepository.findTop10ByOrderByWicketsDesc());

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
