package com.example.care_bridge.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);        // Minimum number of threads kept alive
        executor.setMaxPoolSize(15);       // Maximum allowed threads under heavy load
        executor.setQueueCapacity(100);    // Queue capacity before expanding beyond core size
        executor.setThreadNamePrefix("CareBridgeAsync-");
        executor.initialize();
        return executor;
    }
}