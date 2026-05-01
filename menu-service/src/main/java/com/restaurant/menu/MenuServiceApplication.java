package com.restaurant.menu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Menu Service - Manages food items, ingredients, and pricing.
 * Database: MenuDB (PostgreSQL)
 */
@SpringBootApplication
@EnableDiscoveryClient
public class MenuServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MenuServiceApplication.class, args);
    }

}
