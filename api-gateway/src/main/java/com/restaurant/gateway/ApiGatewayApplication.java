package com.restaurant.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * API Gateway - Central entry point for the restaurant system.
 * Routes requests to appropriate microservices via Eureka discovery.
 *
 * Replaces Zuul (deprecated) with Spring Cloud Gateway for Spring Boot 3.x compatibility.
 * Routes:
 *   /menu/**    -> menu-service
 *   /order/**   -> order-service
 *   /kitchen/** -> kitchen-service
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

}
