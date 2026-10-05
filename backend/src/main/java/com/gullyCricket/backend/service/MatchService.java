package com.gullyCricket.backend.service;

import com.gullyCricket.backend.dto.CreateMatchDTO;
import com.gullyCricket.backend.dto.PlayingXIDTO;
import com.gullyCricket.backend.dto.TossDecisionDTO;
import com.gullyCricket.backend.exception.BadRequestException;
import com.gullyCricket.backend.exception.ForbiddenException;
import com.gullyCricket.backend.exception.ResourceNotFoundException;
import com.gullyCricket.backend.model.BatsmanStats;
import com.gullyCricket.backend.model.BowlerStats;
import com.gullyCricket.backend.model.InningsScore;
import com.gullyCricket.backend.model.Match;
import com.gullyCricket.backend.repository.BallDeliveryRepository;
import com.gullyCricket.backend.repository.InningsScoreRepository;
import com.gullyCricket.backend.repository.MatchRepository;
import com.gullyCricket.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final InningsScoreRepository inningsScoreRepository;
    private final BallDeliveryRepository ballDeliveryRepository;
    private final UserRepository userRepository;

    public MatchService(MatchRepository matchRepository,
                        InningsScoreRepository inningsScoreRepository,
                        BallDeliveryRepository ballDeliveryRepository,
                        UserRepository userRepository) {
        this.matchRepository = matchRepository;
        this.inningsScoreRepository = inningsScoreRepository;
        this.ballDeliveryRepository = ballDeliveryRepository;
        this.userRepository = userRepository;
    }

    public List<Match> getAllMatches() {
        List<Match> matches = matchRepository.findAllByOrderByCreatedAtDesc();
        matches.forEach(this::enrichMatchCreatorName);
        return matches;
    }

    public Match getMatchById(String id) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with id: " + id));
        enrichMatchCreatorName(match);
        return match;
    }

    public List<Match> getMatchesByStatus(String status) {
        List<Match> matches;
        if ("ALL".equalsIgnoreCase(status) || status == null || status.isBlank()) {
            matches = getAllMatches();
        } else {
            matches = matchRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
            matches.forEach(this::enrichMatchCreatorName);
        }
        return matches;
    }

    private void enrichMatchCreatorName(Match match) {
        if (match != null && match.getCreatedBy() != null && (match.getCreatedByName() == null || match.getCreatedByName().isBlank())) {
            userRepository.findById(match.getCreatedBy()).ifPresent(user -> {
                String name = user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : user.getUsername();
                match.setCreatedByName(name);
            });
        }
    }

    public Match createMatch(CreateMatchDTO dto, String userId) {
        if (dto.getTeamA().trim().equalsIgnoreCase(dto.getTeamB().trim())) {
            throw new BadRequestException("Team A and Team B cannot have the same name");
        }
            if (dto.getTotalOvers() < 0) {
            throw new BadRequestException("Total overs must be non-negative");
        }

        Match match = new Match(
                dto.getTeamA().trim(),
                dto.getTeamB().trim(),
                dto.getTotalOvers(),
                dto.getMatchDate(),
                dto.getLocation()
        );
        match.setCreatedBy(userId);
        if (userId != null) {
            userRepository.findById(userId).ifPresent(user -> {
                String name = user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : user.getUsername();
                match.setCreatedByName(name);
            });
        }
        if (dto.getTeamAId() != null) match.setTeamAId(dto.getTeamAId());
        if (dto.getTeamBId() != null) match.setTeamBId(dto.getTeamBId());

        return matchRepository.save(match);
    }

    public Match recordToss(String matchId, TossDecisionDTO dto, String userId) {
        Match match = getMatchById(matchId);
        validateCreatorPermission(match, userId);

        match.setTossWinner(dto.getTossWinner());
        match.setTossDecision(dto.getTossDecision());

        // Determine Batting First vs Bowling First
        String battingFirst;
        String bowlingFirst;
        if (dto.getTossWinner().equalsIgnoreCase(match.getTeamA())) {
            if ("BAT".equalsIgnoreCase(dto.getTossDecision())) {
                battingFirst = match.getTeamA();
                bowlingFirst = match.getTeamB();
            } else {
                battingFirst = match.getTeamB();
                bowlingFirst = match.getTeamA();
            }
        } else {
            if ("BAT".equalsIgnoreCase(dto.getTossDecision())) {
                battingFirst = match.getTeamB();
                bowlingFirst = match.getTeamA();
            } else {
                battingFirst = match.getTeamA();
                bowlingFirst = match.getTeamB();
            }
        }

        match.setBattingTeamFirst(battingFirst);
        match.setBowlingTeamFirst(bowlingFirst);
        match.setStatus("TOSS_DONE");
        match.setCurrentInnings(1);
        match.setUpdatedAt(Instant.now());

        // Initialize Innings 1 Score if not already created
        inningsScoreRepository.findByMatchIdAndInningsNumber(matchId, 1)
                .orElseGet(() -> {
                    InningsScore score1 = new InningsScore(matchId, 1, battingFirst, bowlingFirst);
                    return inningsScoreRepository.save(score1);
                });

        return matchRepository.save(match);
    }

    public Match setPlayingXI(String matchId, PlayingXIDTO dto, String userId) {
        Match match = getMatchById(matchId);
        validateCreatorPermission(match, userId);

        if (dto.getTeamAPlayingXI() != null && !dto.getTeamAPlayingXI().isEmpty()) {
            match.setTeamAPlayingXI(dto.getTeamAPlayingXI());
        }
        if (dto.getTeamBPlayingXI() != null && !dto.getTeamBPlayingXI().isEmpty()) {
            match.setTeamBPlayingXI(dto.getTeamBPlayingXI());
        }

        match.setStatus("LIVE");
        match.setUpdatedAt(Instant.now());

        // Update Innings 1 with opening players
        InningsScore score1 = inningsScoreRepository.findByMatchIdAndInningsNumber(matchId, 1)
                .orElseGet(() -> new InningsScore(matchId, 1, match.getBattingTeamFirst(), match.getBowlingTeamFirst()));

        if (dto.getOpeningStriker() != null && !dto.getOpeningStriker().isBlank()) {
            score1.setCurrentStrikerName(dto.getOpeningStriker());
            boolean exists = score1.getBattingStats().stream().anyMatch(b -> b.getPlayerName().equalsIgnoreCase(dto.getOpeningStriker()));
            if (!exists) {
                BatsmanStats striker = new BatsmanStats(null, dto.getOpeningStriker(), 1);
                striker.setOnStrike(true);
                score1.getBattingStats().add(striker);
            }
        }

        if (dto.getOpeningNonStriker() != null && !dto.getOpeningNonStriker().isBlank()) {
            score1.setCurrentNonStrikerName(dto.getOpeningNonStriker());
            boolean exists = score1.getBattingStats().stream().anyMatch(b -> b.getPlayerName().equalsIgnoreCase(dto.getOpeningNonStriker()));
            if (!exists) {
                BatsmanStats nonStriker = new BatsmanStats(null, dto.getOpeningNonStriker(), 2);
                nonStriker.setOnStrike(false);
                score1.getBattingStats().add(nonStriker);
            }
        }

        if (dto.getOpeningBowler() != null && !dto.getOpeningBowler().isBlank()) {
            score1.setCurrentBowlerName(dto.getOpeningBowler());
            boolean exists = score1.getBowlingStats().stream().anyMatch(b -> b.getPlayerName().equalsIgnoreCase(dto.getOpeningBowler()));
            if (!exists) {
                BowlerStats bowler = new BowlerStats(null, dto.getOpeningBowler());
                bowler.setCurrentBowler(true);
                score1.getBowlingStats().add(bowler);
            }
        }

        if (score1.getCurrentStrikerName() != null) {
            for (BatsmanStats b : score1.getBattingStats()) {
                b.setOnStrike(b.getPlayerName().equalsIgnoreCase(score1.getCurrentStrikerName()) && !b.isOut());
            }
        }
        if (score1.getCurrentBowlerName() != null) {
            for (BowlerStats b : score1.getBowlingStats()) {
                b.setCurrentBowler(b.getPlayerName().equalsIgnoreCase(score1.getCurrentBowlerName()));
            }
        }

        inningsScoreRepository.save(score1);
        return matchRepository.save(match);
    }

    public Match updateStatus(String matchId, String newStatus, String userId) {
        Match match = getMatchById(matchId);
        validateCreatorPermission(match, userId);

        match.setStatus(newStatus.toUpperCase());
        match.setUpdatedAt(Instant.now());
        return matchRepository.save(match);
    }

    public void deleteMatch(String matchId, String userId) {
        Match match = getMatchById(matchId);
        validateCreatorPermission(match, userId);

        ballDeliveryRepository.deleteByMatchId(matchId);
        inningsScoreRepository.deleteByMatchId(matchId);
        matchRepository.delete(match);
    }

    private void validateCreatorPermission(Match match, String userId) {
        if (match.getCreatedBy() != null && userId != null && !match.getCreatedBy().equals(userId)) {
            throw new ForbiddenException("You are not authorized to update this match score.");
        }
    }
}
