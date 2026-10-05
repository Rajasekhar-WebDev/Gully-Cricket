package com.gullyCricket.backend.service;

import com.gullyCricket.backend.dto.BallEventDTO;
import com.gullyCricket.backend.dto.MatchScorecardDTO;
import com.gullyCricket.backend.dto.PlayingXIDTO;
import com.gullyCricket.backend.exception.BadRequestException;
import com.gullyCricket.backend.exception.ForbiddenException;
import com.gullyCricket.backend.exception.ResourceNotFoundException;
import com.gullyCricket.backend.model.*;
import com.gullyCricket.backend.model.*;
import com.gullyCricket.backend.repository.BallDeliveryRepository;
import com.gullyCricket.backend.repository.InningsScoreRepository;
import com.gullyCricket.backend.repository.MatchRepository;
import com.gullyCricket.backend.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ScoringService {

    private final MatchRepository matchRepository;
    private final InningsScoreRepository inningsScoreRepository;
    private final BallDeliveryRepository ballDeliveryRepository;
    private final PlayerRepository playerRepository;

    public ScoringService(MatchRepository matchRepository,
                          InningsScoreRepository inningsScoreRepository,
                          BallDeliveryRepository ballDeliveryRepository,
                          PlayerRepository playerRepository) {
        this.matchRepository = matchRepository;
        this.inningsScoreRepository = inningsScoreRepository;
        this.ballDeliveryRepository = ballDeliveryRepository;
        this.playerRepository = playerRepository;
    }

    public MatchScorecardDTO recordBallDelivery(String matchId, BallEventDTO ballEvent, String userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        if (match.getCreatedBy() != null && userId != null && !match.getCreatedBy().equals(userId)) {
            throw new ForbiddenException("You are not authorized to update this match score.");
        }

        if ("COMPLETED".equalsIgnoreCase(match.getStatus())) {
            throw new BadRequestException("Match is already completed");
        }

        int inningsNum = match.getCurrentInnings();
        InningsScore currentInnings = inningsScoreRepository.findByMatchIdAndInningsNumber(matchId, inningsNum)
                .orElseThrow(() -> new ResourceNotFoundException("Innings " + inningsNum + " not found for match: " + matchId));

        // Ensure batsman and bowler exist in stats
        String strikerName = currentInnings.getCurrentStrikerName();
        String nonStrikerName = currentInnings.getCurrentNonStrikerName();
        String bowlerName = currentInnings.getCurrentBowlerName();

        if (strikerName == null || strikerName.isBlank() || nonStrikerName == null || nonStrikerName.isBlank()) {
            List<String> battingRoster = getRosterForTeam(match, currentInnings.getBattingTeam());
            if (strikerName == null || strikerName.isBlank()) {
                strikerName = !battingRoster.isEmpty() ? battingRoster.get(0) : "Striker 1";
                currentInnings.setCurrentStrikerName(strikerName);
            }
            if (nonStrikerName == null || nonStrikerName.isBlank()) {
                nonStrikerName = battingRoster.size() > 1 ? battingRoster.get(1) : (battingRoster.size() == 1 ? battingRoster.get(0) + " (2)" : "Striker 2");
                currentInnings.setCurrentNonStrikerName(nonStrikerName);
            }
        }
        if (bowlerName == null || bowlerName.isBlank()) {
            List<String> bowlingRoster = getRosterForTeam(match, currentInnings.getBowlingTeam());
            bowlerName = !bowlingRoster.isEmpty() ? bowlingRoster.get(0) : "Bowler 1";
            currentInnings.setCurrentBowlerName(bowlerName);
        }

        BatsmanStats striker = getOrCreateBatsman(currentInnings, strikerName, true);
        BatsmanStats nonStriker = getOrCreateBatsman(currentInnings, nonStrikerName, false);
        BowlerStats bowler = getOrCreateBowler(currentInnings, bowlerName);

        String extrasType = ballEvent.getExtrasType() != null ? ballEvent.getExtrasType().toUpperCase() : "NONE";
        boolean isLegal = !"WIDE".equals(extrasType) && !"NO_BALL".equals(extrasType);

        int runsBat = ballEvent.getRunsOffBat();
        int extraRuns = ballEvent.getExtraRuns();

        // Calculate total runs on this ball
        int ballTotalRuns = runsBat;
        if ("WIDE".equals(extrasType) || "NO_BALL".equals(extrasType)) {
            ballTotalRuns += Math.max(1, extraRuns);
        } else if ("BYE".equals(extrasType) || "LEG_BYE".equals(extrasType)) {
            ballTotalRuns += extraRuns;
        }

        // 1. Update Innings Score Total
        currentInnings.setTotalRuns(currentInnings.getTotalRuns() + ballTotalRuns);

        // 2. Update Extras
        Extras extras = currentInnings.getExtras();
        if ("WIDE".equals(extrasType)) {
            extras.setWides(extras.getWides() + Math.max(1, extraRuns));
        } else if ("NO_BALL".equals(extrasType)) {
            extras.setNoBalls(extras.getNoBalls() + Math.max(1, extraRuns));
        } else if ("BYE".equals(extrasType)) {
            extras.setByes(extras.getByes() + extraRuns);
        } else if ("LEG_BYE".equals(extrasType)) {
            extras.setLegByes(extras.getLegByes() + extraRuns);
        }

        // 3. Update Striker Stats
        if (!"WIDE".equals(extrasType)) {
            // Batsman faces ball on legal deliveries and No Balls
            striker.setBalls(striker.getBalls() + 1);
        }
        striker.setRuns(striker.getRuns() + runsBat);
        if (runsBat == 4) striker.setFours(striker.getFours() + 1);
        if (runsBat == 6) striker.setSixes(striker.getSixes() + 1);
        striker.updateStrikeRate();

        // 4. Update Bowler Stats
        if ("WIDE".equals(extrasType)) {
            bowler.setWides(bowler.getWides() + Math.max(1, extraRuns));
            bowler.setRunsConceded(bowler.getRunsConceded() + Math.max(1, extraRuns));
        } else if ("NO_BALL".equals(extrasType)) {
            bowler.setNoBalls(bowler.getNoBalls() + Math.max(1, extraRuns));
            bowler.setRunsConceded(bowler.getRunsConceded() + Math.max(1, extraRuns) + runsBat);
        } else {
            // Bowler only charged runs off bat on legal deliveries (byes/leg byes don't charge bowler)
            bowler.setRunsConceded(bowler.getRunsConceded() + runsBat);
            if (runsBat == 0 && "NONE".equals(extrasType)) {
                bowler.setDots(bowler.getDots() + 1);
            }
        }

        // 5. Handle Legal Ball and Overs
        boolean overFinished = false;
        if (isLegal) {
            int currentBall = currentInnings.getBallsInCurrentOver() + 1;
            bowler.setBallsInCurrentOver(bowler.getBallsInCurrentOver() + 1);

            if (currentBall >= 6) {
                currentInnings.setCompletedOvers(currentInnings.getCompletedOvers() + 1);
                currentInnings.setBallsInCurrentOver(0);

                bowler.setCompletedOvers(bowler.getCompletedOvers() + 1);
                bowler.setBallsInCurrentOver(0);
                overFinished = true;
            } else {
                currentInnings.setBallsInCurrentOver(currentBall);
            }
        }
        bowler.updateEconomy();

        // 6. Handle Wickets
        if (ballEvent.isWicket()) {
            currentInnings.setWickets(currentInnings.getWickets() + 1);

            String dismissalType = ballEvent.getDismissalType() != null ? ballEvent.getDismissalType().toUpperCase() : "BOWLED";
            String outBatsmanName = ballEvent.getDismissedBatsmanName() != null && !ballEvent.getDismissedBatsmanName().isBlank()
                    ? ballEvent.getDismissedBatsmanName()
                    : striker.getPlayerName();

            BatsmanStats outBatsman = outBatsmanName.equalsIgnoreCase(nonStriker.getPlayerName()) ? nonStriker : striker;
            outBatsman.setOut(true);
            outBatsman.setOnStrike(false);

            String dismissText;
            if ("BOWLED".equals(dismissalType)) {
                dismissText = "OUT - Bowled (b " + bowler.getPlayerName() + ")";
            } else if ("CAUGHT".equals(dismissalType)) {
                String fielder = ballEvent.getFielderName() != null && !ballEvent.getFielderName().isBlank() ? ballEvent.getFielderName() : "";
                dismissText = "OUT - Caught" + (!fielder.isEmpty() ? " (c " + fielder + " b " + bowler.getPlayerName() + ")" : " (b " + bowler.getPlayerName() + ")");
            } else if ("LBW".equals(dismissalType)) {
                dismissText = "OUT - LBW (b " + bowler.getPlayerName() + ")";
            } else if ("RUN_OUT".equals(dismissalType)) {
                String fielder = ballEvent.getFielderName() != null && !ballEvent.getFielderName().isBlank() ? ballEvent.getFielderName() : "";
                dismissText = "OUT - Run Out" + (!fielder.isEmpty() ? " (" + fielder + ")" : "");
            } else if ("STUMPED".equals(dismissalType)) {
                dismissText = "OUT - Stumped (b " + bowler.getPlayerName() + ")";
            } else if ("HIT_WICKET".equals(dismissalType)) {
                dismissText = "OUT - Hit Wicket (b " + bowler.getPlayerName() + ")";
            } else {
                dismissText = "OUT - " + (dismissalType.equalsIgnoreCase("OTHER") ? "Other" : dismissalType);
            }
            outBatsman.setDismissalInfo(dismissText);
            outBatsman.setBowlerName(bowler.getPlayerName());
            outBatsman.setFielderName(ballEvent.getFielderName());

            // Bowler gets credit for wicket if not run out
            if (!"RUN_OUT".equals(dismissalType)) {
                bowler.setWickets(bowler.getWickets() + 1);
            }

            // Record Fall of Wickets
            String overAtDismissal = currentInnings.getOversDisplay();
            WicketDetail wicketDetail = new WicketDetail(
                    currentInnings.getWickets(),
                    outBatsman.getPlayerName(),
                    currentInnings.getTotalRuns(),
                    overAtDismissal,
                    dismissalType,
                    bowler.getPlayerName(),
                    ballEvent.getFielderName()
            );
            currentInnings.getFallOfWickets().add(wicketDetail);

            // Handle incoming new batsman
            if (ballEvent.getNewBatsmanName() != null && !ballEvent.getNewBatsmanName().isBlank()) {
                String newBatName = ballEvent.getNewBatsmanName().trim();
                boolean alreadyOut = currentInnings.getBattingStats().stream()
                        .anyMatch(b -> b.getPlayerName().equalsIgnoreCase(newBatName) && b.isOut());
                if (alreadyOut) {
                    throw new IllegalArgumentException("Player '" + newBatName + "' has already been dismissed and cannot bat again.");
                }
                boolean isNewBatsmanOnStrike = (outBatsman == striker);
                BatsmanStats newBatsman = getOrCreateBatsman(currentInnings, newBatName, isNewBatsmanOnStrike);
                newBatsman.setOnStrike(isNewBatsmanOnStrike);
                if (outBatsman == striker) {
                    currentInnings.setCurrentStrikerName(newBatsman.getPlayerName());
                    striker = newBatsman;
                } else {
                    currentInnings.setCurrentNonStrikerName(newBatsman.getPlayerName());
                    nonStriker = newBatsman;
                    striker.setOnStrike(true);
                }
            } else {
                // No new batsman provided — check if any available (not-out, not on crease) players remain
                Set<String> outNames = currentInnings.getBattingStats().stream()
                        .filter(BatsmanStats::isOut)
                        .map(b -> b.getPlayerName().toLowerCase())
                        .collect(java.util.stream.Collectors.toSet());
                // The remaining active batsman (non-dismissed one still on crease)
                BatsmanStats remaining = (outBatsman == striker) ? nonStriker : striker;
                String remainingName = remaining != null ? remaining.getPlayerName().toLowerCase() : null;

                List<String> roster = getRosterForTeam(match, currentInnings.getBattingTeam());
                long availableCount = roster.stream()
                        .filter(n -> n != null && !n.isBlank())
                        .filter(n -> !outNames.contains(n.toLowerCase()))
                        .filter(n -> remainingName == null || !n.toLowerCase().equals(remainingName))
                        .count();

                if (availableCount > 0) {
                    // Players still available — caller must supply a new batsman name
                    throw new IllegalArgumentException("No new batsman selected. Please choose the next incoming batsman.");
                }
                // No more players — last-man scenario; clear non-striker if dismissed
                if (outBatsman == striker) {
                    // striker is out; only non-striker remains alone (last man)
                    currentInnings.setCurrentStrikerName(remaining != null ? remaining.getPlayerName() : "");
                    currentInnings.setCurrentNonStrikerName("");
                    if (remaining != null) {
                        remaining.setOnStrike(true);
                    }
                    striker = remaining;
                } else {
                    // non-striker is out; striker bats alone
                    currentInnings.setCurrentNonStrikerName("");
                }
            }
        }

        // 7. Strike Rotation
        // Odd runs scored rotate strike
        int runsForRotation = runsBat + ("BYE".equals(extrasType) || "LEG_BYE".equals(extrasType) ? extraRuns : 0);
        if (runsForRotation % 2 != 0) {
            swapStrike(currentInnings, striker, nonStriker);
        }

        // At end of over, batsmen swap ends
        if (overFinished) {
            swapStrike(currentInnings, striker, nonStriker);
            // Switch bowler if nextBowlerName provided
            if (ballEvent.getNextBowlerName() != null && !ballEvent.getNextBowlerName().isBlank()) {
                currentInnings.setCurrentBowlerName(ballEvent.getNextBowlerName());
                for (BowlerStats b : currentInnings.getBowlingStats()) {
                    b.setCurrentBowler(false);
                }
                BowlerStats nextB = getOrCreateBowler(currentInnings, ballEvent.getNextBowlerName());
                nextB.setCurrentBowler(true);
            }
        }

        // 8. Create and Save Ball Delivery Record
        BallDelivery delivery = new BallDelivery();
        delivery.setMatchId(matchId);
        delivery.setInningsNumber(inningsNum);
        delivery.setOverNumber(currentInnings.getCompletedOvers() + (overFinished ? 0 : 1));
        delivery.setBallNumberInOver(currentInnings.getBallsInCurrentOver());
        delivery.setBallDisplay(currentInnings.getOversDisplay());
        delivery.setBatsmanName(striker.getPlayerName());
        delivery.setNonStrikerName(nonStriker.getPlayerName());
        delivery.setBowlerName(bowler.getPlayerName());
        delivery.setRunsOffBat(runsBat);
        delivery.setExtrasType(extrasType);
        delivery.setExtraRuns(extraRuns);
        delivery.setTotalRuns(ballTotalRuns);
        delivery.setLegalDelivery(isLegal);
        delivery.setWicket(ballEvent.isWicket());
        delivery.setDismissalType(ballEvent.getDismissalType());
        delivery.setDismissedPlayerName(ballEvent.getDismissedBatsmanName() != null ? ballEvent.getDismissedBatsmanName() : striker.getPlayerName());
        delivery.setFielderName(ballEvent.getFielderName());
        delivery.setScoreAtBall(currentInnings.getTotalRuns() + "/" + currentInnings.getWickets());

        String commentary = generateCommentary(bowler.getPlayerName(), striker.getPlayerName(), runsBat, extrasType, extraRuns, ballEvent);
        delivery.setCommentary(commentary);

        ballDeliveryRepository.save(delivery);

        // 9. Check Innings / Match Completion
        checkInningsAndMatchProgress(match, currentInnings);

        // Update score summary cache on match
        if (inningsNum == 1) {
            match.setScoreSummaryTeamA(currentInnings.getBattingTeam() + " " + currentInnings.getTotalRuns() + "/" + currentInnings.getWickets() + " (" + currentInnings.getOversDisplay() + ")");
        } else {
            match.setScoreSummaryTeamB(currentInnings.getBattingTeam() + " " + currentInnings.getTotalRuns() + "/" + currentInnings.getWickets() + " (" + currentInnings.getOversDisplay() + ")");
        }

        syncInningsState(currentInnings);
        inningsScoreRepository.save(currentInnings);
        matchRepository.save(match);

        // If match finished, update player career statistics
        if ("COMPLETED".equalsIgnoreCase(match.getStatus())) {
            updateCareerStatsFromMatch(match);
        }

        return getScorecard(matchId);
    }

    public MatchScorecardDTO undoLastDelivery(String matchId, String userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        if (match.getCreatedBy() != null && userId != null && !match.getCreatedBy().equals(userId)) {
            throw new ForbiddenException("You are not authorized to update this match score.");
        }

        int inningsNum = match.getCurrentInnings();
        Optional<BallDelivery> lastBallOpt = ballDeliveryRepository.findTopByMatchIdAndInningsNumberOrderByTimestampDesc(matchId, inningsNum);

        if (lastBallOpt.isEmpty()) {
            throw new BadRequestException("No balls to undo in current innings");
        }

        BallDelivery lastBall = lastBallOpt.get();
        ballDeliveryRepository.delete(lastBall);

        // Recalculate innings score from remaining balls in this innings
        InningsScore currentInnings = inningsScoreRepository.findByMatchIdAndInningsNumber(matchId, inningsNum)
                .orElseThrow(() -> new ResourceNotFoundException("Innings not found: " + inningsNum));

        recalculateInningsFromDeliveries(match, currentInnings);

        return getScorecard(matchId);
    }

    private void recalculateInningsFromDeliveries(Match match, InningsScore innings) {
        List<BallDelivery> balls = ballDeliveryRepository.findByMatchIdAndInningsNumberOrderByTimestampAsc(match.getId(), innings.getInningsNumber());

        innings.setTotalRuns(0);
        innings.setWickets(0);
        innings.setCompletedOvers(0);
        innings.setBallsInCurrentOver(0);
        innings.setExtras(new Extras());
        innings.getBattingStats().clear();
        innings.getBowlingStats().clear();
        innings.getFallOfWickets().clear();
        innings.setCompleted(false);

        // Replay all remaining deliveries
        for (BallDelivery b : balls) {
            BatsmanStats striker = getOrCreateBatsman(innings, b.getBatsmanName(), true);
            BowlerStats bowler = getOrCreateBowler(innings, b.getBowlerName());

            innings.setTotalRuns(innings.getTotalRuns() + b.getTotalRuns());

            // Extras
            Extras ex = innings.getExtras();
            if ("WIDE".equals(b.getExtrasType())) ex.setWides(ex.getWides() + Math.max(1, b.getExtraRuns()));
            if ("NO_BALL".equals(b.getExtrasType())) ex.setNoBalls(ex.getNoBalls() + Math.max(1, b.getExtraRuns()));
            if ("BYE".equals(b.getExtrasType())) ex.setByes(ex.getByes() + b.getExtraRuns());
            if ("LEG_BYE".equals(b.getExtrasType())) ex.setLegByes(ex.getLegByes() + b.getExtraRuns());

            // Batsman
            if (!"WIDE".equals(b.getExtrasType())) striker.setBalls(striker.getBalls() + 1);
            striker.setRuns(striker.getRuns() + b.getRunsOffBat());
            if (b.getRunsOffBat() == 4) striker.setFours(striker.getFours() + 1);
            if (b.getRunsOffBat() == 6) striker.setSixes(striker.getSixes() + 1);
            striker.updateStrikeRate();

            // Bowler
            if ("WIDE".equals(b.getExtrasType()) || "NO_BALL".equals(b.getExtrasType())) {
                bowler.setRunsConceded(bowler.getRunsConceded() + b.getTotalRuns());
                if ("WIDE".equals(b.getExtrasType())) bowler.setWides(bowler.getWides() + 1);
                if ("NO_BALL".equals(b.getExtrasType())) bowler.setNoBalls(bowler.getNoBalls() + 1);
            } else {
                bowler.setRunsConceded(bowler.getRunsConceded() + b.getRunsOffBat());
            }

            if (b.isLegalDelivery()) {
                int ball = innings.getBallsInCurrentOver() + 1;
                bowler.setBallsInCurrentOver(bowler.getBallsInCurrentOver() + 1);
                if (ball >= 6) {
                    innings.setCompletedOvers(innings.getCompletedOvers() + 1);
                    innings.setBallsInCurrentOver(0);
                    bowler.setCompletedOvers(bowler.getCompletedOvers() + 1);
                    bowler.setBallsInCurrentOver(0);
                } else {
                    innings.setBallsInCurrentOver(ball);
                }
            }
            bowler.updateEconomy();

            if (b.isWicket()) {
                innings.setWickets(innings.getWickets() + 1);
                String outName = b.getDismissedPlayerName() != null && !b.getDismissedPlayerName().isBlank()
                        ? b.getDismissedPlayerName()
                        : b.getBatsmanName();
                BatsmanStats outB = getOrCreateBatsman(innings, outName, false);
                outB.setOut(true);
                outB.setOnStrike(false);
                String dt = b.getDismissalType() != null ? b.getDismissalType().toUpperCase() : "OUT";
                outB.setDismissalInfo("OUT - " + (dt.equalsIgnoreCase("OTHER") ? "Other" : dt));
                if (!"RUN_OUT".equalsIgnoreCase(b.getDismissalType())) {
                    bowler.setWickets(bowler.getWickets() + 1);
                }
                innings.getFallOfWickets().add(new WicketDetail(
                        innings.getWickets(),
                        outName,
                        innings.getTotalRuns(),
                        innings.getOversDisplay(),
                        b.getDismissalType(),
                        bowler.getPlayerName(),
                        b.getFielderName()
                ));
            }
        }

        syncInningsState(innings);
        inningsScoreRepository.save(innings);
    }

    private void checkInningsAndMatchProgress(Match match, InningsScore currentInnings) {
        int maxOvers = match.getTotalOvers();

        // All-out: no available (not-dismissed, not-on-crease) players remain from the roster
        List<String> roster = getRosterForTeam(match, currentInnings.getBattingTeam());
        Set<String> outNames = currentInnings.getBattingStats().stream()
                .filter(BatsmanStats::isOut)
                .map(b -> b.getPlayerName().toLowerCase())
                .collect(java.util.stream.Collectors.toSet());
        // Players currently on crease
        Set<String> onCreaseNames = currentInnings.getBattingStats().stream()
                .filter(b -> !b.isOut())
                .map(b -> b.getPlayerName().toLowerCase())
                .collect(java.util.stream.Collectors.toSet());
        // Use wicket count if roster is unknown/empty; otherwise roster-aware check
        boolean isAllOut;
        if (!roster.isEmpty()) {
            long available = roster.stream()
                    .filter(n -> n != null && !n.isBlank())
                    .filter(n -> !outNames.contains(n.toLowerCase()))
                    .filter(n -> !onCreaseNames.contains(n.toLowerCase()))
                    .count();
            // All out when no players left to come in AND only 0 or 1 batsman on crease
            isAllOut = available == 0 && onCreaseNames.size() <= 1;
        } else {
            // Fallback: all out if wickets >= roster size inferred from batting stats
            int totalBatted = currentInnings.getBattingStats().size();
            isAllOut = currentInnings.getWickets() >= Math.max(10, totalBatted - 1);
        }

                boolean isOversComplete = maxOvers > 0 && currentInnings.getCompletedOvers() >= maxOvers;

        if (match.getCurrentInnings() == 1) {
            if (isAllOut || isOversComplete) {
                currentInnings.setCompleted(true);
                match.setStatus("INNINGS_BREAK");
                match.setCurrentInnings(2);

                int target = currentInnings.getTotalRuns() + 1;

                // Create or find Innings 2 score
                InningsScore innings2 = inningsScoreRepository.findByMatchIdAndInningsNumber(match.getId(), 2)
                        .orElseGet(() -> {
                            InningsScore score2 = new InningsScore(match.getId(), 2, match.getBowlingTeamFirst(), match.getBattingTeamFirst());
                            score2.setTargetRuns(target);
                            return inningsScoreRepository.save(score2);
                        });
                innings2.setTargetRuns(target);
                inningsScoreRepository.save(innings2);
            }
        } else if (match.getCurrentInnings() == 2) {
            int target = currentInnings.getTargetRuns() != null ? currentInnings.getTargetRuns() : 0;
            InningsScore innings1 = inningsScoreRepository.findByMatchIdAndInningsNumber(match.getId(), 1).orElse(null);
            int inn1Runs = innings1 != null ? innings1.getTotalRuns() : 0;

            // Target reached!
            if (currentInnings.getTotalRuns() >= target) {
                currentInnings.setCompleted(true);
                match.setStatus("COMPLETED");
                match.setWinner(currentInnings.getBattingTeam());
                int wicketsLeft = 10 - currentInnings.getWickets();
                match.setWinMargin(wicketsLeft);
                match.setWinMarginType("WICKETS");
                match.setResultDescription(currentInnings.getBattingTeam() + " won by " + wicketsLeft + " wickets!");
            }
            // Overs completed or all out without reaching target
            else if (isAllOut || isOversComplete) {
                currentInnings.setCompleted(true);
                match.setStatus("COMPLETED");

                if (currentInnings.getTotalRuns() > inn1Runs) {
                    match.setWinner(currentInnings.getBattingTeam());
                    int wicketsLeft = 10 - currentInnings.getWickets();
                    match.setWinMargin(wicketsLeft);
                    match.setWinMarginType("WICKETS");
                    match.setResultDescription(currentInnings.getBattingTeam() + " won by " + wicketsLeft + " wickets!");
                } else if (currentInnings.getTotalRuns() < inn1Runs) {
                    match.setWinner(match.getBattingTeamFirst());
                    int runsDiff = inn1Runs - currentInnings.getTotalRuns();
                    match.setWinMargin(runsDiff);
                    match.setWinMarginType("RUNS");
                    match.setResultDescription(match.getBattingTeamFirst() + " won by " + runsDiff + " runs!");
                } else {
                    match.setWinner("TIE");
                    match.setWinMargin(0);
                    match.setWinMarginType("TIE");
                    match.setResultDescription("Match Tied!");
                }
            }
        }
    }

    public MatchScorecardDTO getScorecard(String matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        InningsScore inn1 = inningsScoreRepository.findByMatchIdAndInningsNumber(matchId, 1).orElse(null);
        InningsScore inn2 = inningsScoreRepository.findByMatchIdAndInningsNumber(matchId, 2).orElse(null);

        InningsScore currentInnings = match.getCurrentInnings() == 2 && inn2 != null ? inn2 : inn1;

        MatchScorecardDTO dto = new MatchScorecardDTO(match, inn1, inn2, currentInnings);

        // Load recent balls in current innings
        if (currentInnings != null) {
            List<BallDelivery> allBalls = ballDeliveryRepository.findByMatchIdAndInningsNumberOrderByTimestampAsc(matchId, currentInnings.getInningsNumber());
            int total = allBalls.size();
            dto.setRecentBalls(allBalls.subList(Math.max(0, total - 12), total));

            // Current over balls
            int completedOvers = currentInnings.getCompletedOvers();
            int currentOverNum = completedOvers + 1;
            List<BallDelivery> currentOver = allBalls.stream()
                    .filter(b -> b.getOverNumber() == currentOverNum)
                    .toList();
            dto.setCurrentOverBalls(currentOver);
        }

        return dto;
    }

    public MatchScorecardDTO setCurrentBowler(String matchId, String bowlerName, String userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        if (match.getCreatedBy() != null && userId != null && !match.getCreatedBy().equals(userId)) {
            throw new ForbiddenException("You are not authorized to update this match.");
        }

        int inningsNum = match.getCurrentInnings();
        InningsScore currentInnings = inningsScoreRepository.findByMatchIdAndInningsNumber(matchId, inningsNum)
                .orElseThrow(() -> new ResourceNotFoundException("Innings " + inningsNum + " not found for match: " + matchId));

        // Mark all existing bowlers as not current
        for (BowlerStats b : currentInnings.getBowlingStats()) {
            b.setCurrentBowler(false);
        }

        // Get or create bowler entry and set as current
        BowlerStats bowler = getOrCreateBowler(currentInnings, bowlerName);
        bowler.setCurrentBowler(true);
        currentInnings.setCurrentBowlerName(bowlerName);

        syncInningsState(currentInnings);
        inningsScoreRepository.save(currentInnings);
        return getScorecard(matchId);
    }

    public MatchScorecardDTO setupInnings2(String matchId, PlayingXIDTO dto, String userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        if (match.getCreatedBy() != null && userId != null && !match.getCreatedBy().equals(userId)) {
            throw new ForbiddenException("You are not authorized to update this match.");
        }

        match.setCurrentInnings(2);
        match.setStatus("LIVE");
        match.setUpdatedAt(Instant.now());

        InningsScore inn1 = inningsScoreRepository.findByMatchIdAndInningsNumber(matchId, 1).orElse(null);
        int target = inn1 != null ? inn1.getTotalRuns() + 1 : 1;

        InningsScore innings2 = inningsScoreRepository.findByMatchIdAndInningsNumber(matchId, 2)
                .orElseGet(() -> new InningsScore(matchId, 2, match.getBowlingTeamFirst(), match.getBattingTeamFirst()));

        innings2.setTargetRuns(target);
        innings2.setCompleted(false);

        String battingTeam = innings2.getBattingTeam() != null && !innings2.getBattingTeam().isBlank()
                ? innings2.getBattingTeam()
                : (match.getBowlingTeamFirst() != null ? match.getBowlingTeamFirst() : match.getTeamB());
        String bowlingTeam = innings2.getBowlingTeam() != null && !innings2.getBowlingTeam().isBlank()
                ? innings2.getBowlingTeam()
                : (match.getBattingTeamFirst() != null ? match.getBattingTeamFirst() : match.getTeamA());

        innings2.setBattingTeam(battingTeam);
        innings2.setBowlingTeam(bowlingTeam);

        String striker = (dto != null && dto.getOpeningStriker() != null && !dto.getOpeningStriker().isBlank())
                ? dto.getOpeningStriker().trim()
                : null;
        String nonStriker = (dto != null && dto.getOpeningNonStriker() != null && !dto.getOpeningNonStriker().isBlank())
                ? dto.getOpeningNonStriker().trim()
                : null;
        String bowler = (dto != null && dto.getOpeningBowler() != null && !dto.getOpeningBowler().isBlank())
                ? dto.getOpeningBowler().trim()
                : null;

        List<String> battingRoster = getRosterForTeam(match, battingTeam);
        List<String> bowlingRoster = getRosterForTeam(match, bowlingTeam);

        if (striker == null || striker.isBlank()) {
            striker = !battingRoster.isEmpty() ? battingRoster.get(0) : "Striker 1";
        }
        if (nonStriker == null || nonStriker.isBlank()) {
            if (battingRoster.size() > 1) {
                nonStriker = battingRoster.get(1);
            } else if (battingRoster.size() == 1 && !battingRoster.get(0).equalsIgnoreCase(striker)) {
                nonStriker = battingRoster.get(0);
            } else {
                nonStriker = !battingRoster.isEmpty() ? battingRoster.get(0) + " (2)" : "Striker 2";
            }
        }
        if (bowler == null || bowler.isBlank()) {
            bowler = !bowlingRoster.isEmpty() ? bowlingRoster.get(0) : "Bowler 1";
        }

        innings2.setCurrentStrikerName(striker);
        innings2.setCurrentNonStrikerName(nonStriker);
        innings2.setCurrentBowlerName(bowler);

        BatsmanStats s = getOrCreateBatsman(innings2, striker, true);
        s.setBattingOrder(1);

        BatsmanStats ns = getOrCreateBatsman(innings2, nonStriker, false);
        ns.setBattingOrder(2);

        BowlerStats bw = getOrCreateBowler(innings2, bowler);

        syncInningsState(innings2);
        inningsScoreRepository.save(innings2);
        matchRepository.save(match);

        return getScorecard(matchId);
    }

    public MatchScorecardDTO swapStrikeManual(String matchId, String userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        if (match.getCreatedBy() != null && userId != null && !match.getCreatedBy().equals(userId)) {
            throw new ForbiddenException("You are not authorized to update this match.");
        }

        int inningsNum = match.getCurrentInnings();
        InningsScore currentInnings = inningsScoreRepository.findByMatchIdAndInningsNumber(matchId, inningsNum)
                .orElseThrow(() -> new ResourceNotFoundException("Innings not found: " + inningsNum));

        BatsmanStats striker = currentInnings.getBattingStats().stream()
                .filter(b -> b.isOnStrike() && !b.isOut())
                .findFirst()
                .orElse(null);
        BatsmanStats nonStriker = currentInnings.getBattingStats().stream()
                .filter(b -> !b.isOnStrike() && !b.isOut())
                .findFirst()
                .orElse(null);

        if (striker != null && nonStriker != null) {
            swapStrike(currentInnings, striker, nonStriker);
        } else {
            String temp = currentInnings.getCurrentStrikerName();
            currentInnings.setCurrentStrikerName(currentInnings.getCurrentNonStrikerName());
            currentInnings.setCurrentNonStrikerName(temp);
            syncInningsState(currentInnings);
        }
        inningsScoreRepository.save(currentInnings);

        return getScorecard(matchId);
    }

    private List<String> getRosterForTeam(Match match, String teamName) {
        if (teamName == null) return List.of();
        boolean isTeamA = teamName.equalsIgnoreCase(match.getTeamA());
        List<String> xi = isTeamA ? match.getTeamAPlayingXI() : match.getTeamBPlayingXI();
        if (xi != null && !xi.isEmpty()) {
            return xi;
        }
        String teamId = isTeamA ? match.getTeamAId() : match.getTeamBId();
        if (teamId != null && !teamId.isBlank()) {
            List<Player> byId = playerRepository.findByTeamId(teamId);
            if (byId != null && !byId.isEmpty()) {
                return byId.stream().map(Player::getName).toList();
            }
        }
        List<Player> players = playerRepository.findByTeamNameIgnoreCase(teamName);
        return players != null ? players.stream().map(Player::getName).toList() : List.of();
    }

    private void syncInningsState(InningsScore innings) {
        if (innings == null) return;
        String striker = innings.getCurrentStrikerName();
        String bowler = innings.getCurrentBowlerName();

        if (innings.getBattingStats() != null) {
            for (BatsmanStats b : innings.getBattingStats()) {
                if (b.isOut()) {
                    b.setOnStrike(false);
                } else if (striker != null && b.getPlayerName().equalsIgnoreCase(striker)) {
                    b.setOnStrike(true);
                } else {
                    b.setOnStrike(false);
                }
            }
        }

        if (innings.getBowlingStats() != null) {
            for (BowlerStats b : innings.getBowlingStats()) {
                if (bowler != null && b.getPlayerName().equalsIgnoreCase(bowler)) {
                    b.setCurrentBowler(true);
                } else {
                    b.setCurrentBowler(false);
                }
            }
        }
    }

    private void swapStrike(InningsScore innings, BatsmanStats striker, BatsmanStats nonStriker) {
        // Skip swap if only one batsman on crease (last-man / no partner scenario)
        String currentNonStriker = innings.getCurrentNonStrikerName();
        if (currentNonStriker == null || currentNonStriker.isBlank()) {
            return;
        }
        String temp = innings.getCurrentStrikerName();
        innings.setCurrentStrikerName(innings.getCurrentNonStrikerName());
        innings.setCurrentNonStrikerName(temp);
        syncInningsState(innings);
    }

    private BatsmanStats getOrCreateBatsman(InningsScore innings, String name, boolean onStrike) {
        for (BatsmanStats b : innings.getBattingStats()) {
            if (b.getPlayerName().equalsIgnoreCase(name)) {
                if (onStrike) {
                    innings.setCurrentStrikerName(b.getPlayerName());
                } else {
                    innings.setCurrentNonStrikerName(b.getPlayerName());
                }
                syncInningsState(innings);
                return b;
            }
        }
        BatsmanStats newB = new BatsmanStats(null, name, innings.getBattingStats().size() + 1);
        innings.getBattingStats().add(newB);
        if (onStrike) {
            innings.setCurrentStrikerName(name);
        } else {
            innings.setCurrentNonStrikerName(name);
        }
        syncInningsState(innings);
        return newB;
    }

    private BowlerStats getOrCreateBowler(InningsScore innings, String name) {
        innings.setCurrentBowlerName(name);
        for (BowlerStats b : innings.getBowlingStats()) {
            if (b.getPlayerName().equalsIgnoreCase(name)) {
                syncInningsState(innings);
                return b;
            }
        }
        BowlerStats newBowler = new BowlerStats(null, name);
        innings.getBowlingStats().add(newBowler);
        syncInningsState(innings);
        return newBowler;
    }

    private String generateCommentary(String bowler, String batsman, int runs, String extrasType, int extraRuns, BallEventDTO event) {
        if (event.isWicket()) {
            return "OUT! " + batsman + " is " + (event.getDismissalType() != null ? event.getDismissalType() : "out") + "! " + bowler + " strikes!";
        }
        if ("WIDE".equals(extrasType)) {
            return bowler + " bowls wide down the leg side. +1 run.";
        }
        if ("NO_BALL".equals(extrasType)) {
            return "NO BALL by " + bowler + "! Free hit coming up!";
        }
        if (runs == 6) {
            return "SIX! " + batsman + " launches it over the street roof for a massive maximum!";
        }
        if (runs == 4) {
            return "FOUR! Glorious drive by " + batsman + " finding the boundary gap!";
        }
        if (runs == 0) {
            return bowler + " bowls a sharp dot ball to " + batsman + ". Well defended.";
        }
        return batsman + " pushes to the outfield for " + runs + (runs == 1 ? " run." : " runs.");
    }

    private void updateCareerStatsFromMatch(Match match) {
        List<InningsScore> inningsList = inningsScoreRepository.findByMatchIdOrderByInningsNumberAsc(match.getId());
        for (InningsScore inn : inningsList) {
            for (BatsmanStats b : inn.getBattingStats()) {
                List<Player> players = playerRepository.findByTeamNameIgnoreCase(inn.getBattingTeam());
                for (Player p : players) {
                    if (p.getName().equalsIgnoreCase(b.getPlayerName())) {
                        p.setMatches(p.getMatches() + 1);
                        p.setRuns(p.getRuns() + b.getRuns());
                        p.setBallsFaced(p.getBallsFaced() + b.getBalls());
                        p.setFours(p.getFours() + b.getFours());
                        p.setSixes(p.getSixes() + b.getSixes());
                        if (b.getRuns() > p.getHighestScore()) p.setHighestScore(b.getRuns());
                        p.recalculateStats();
                        playerRepository.save(p);
                        break;
                    }
                }
            }
            for (BowlerStats bw : inn.getBowlingStats()) {
                List<Player> players = playerRepository.findByTeamNameIgnoreCase(inn.getBowlingTeam());
                for (Player p : players) {
                    if (p.getName().equalsIgnoreCase(bw.getPlayerName())) {
                        p.setWickets(p.getWickets() + bw.getWickets());
                        p.setOversBowled(p.getOversBowled() + bw.getTotalOversDecimal());
                        p.setRunsConceded(p.getRunsConceded() + bw.getRunsConceded());
                        p.setDots(p.getDots() + bw.getDots());
                        p.recalculateStats();
                        playerRepository.save(p);
                        break;
                    }
                }
            }
        }
    }
}
