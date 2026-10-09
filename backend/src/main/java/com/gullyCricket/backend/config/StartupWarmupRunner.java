package com.gullyCricket.backend.config;

import com.gullyCricket.backend.service.StatsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
public class StartupWarmupRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(StartupWarmupRunner.class);

    private final MongoTemplate mongoTemplate;
    private final StatsService statsService;

    public StartupWarmupRunner(MongoTemplate mongoTemplate, StatsService statsService) {
        this.mongoTemplate = mongoTemplate;
        this.statsService = statsService;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("⚡ Pre-warming Gully Cricket database connections and statistics cache...");
        try {
            mongoTemplate.getCollectionNames();
            statsService.getDashboardStats();
            log.info("✅ Database connection pool & cache successfully pre-warmed for instant response!");
        } catch (Exception e) {
            log.warn("Warmup initialization warning: {}", e.getMessage());
        }
    }

    // Keep MongoDB pool connection warm every 10 minutes
    @Scheduled(fixedRate = 600000)
    public void keepAliveWarmup() {
        try {
            mongoTemplate.getCollectionNames();
        } catch (Exception ignored) {
        }
    }
}
