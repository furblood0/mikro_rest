package com.restaurant.kitchen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Kitchen Service - Tracks order preparation status.
 * Database: KitchenDB (PostgreSQL)
 */
@SpringBootApplication
@EnableDiscoveryClient
public class KitchenServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(KitchenServiceApplication.class, args);
    }

}
