package com.restaurant.gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger("HTTP");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        long start = System.currentTimeMillis();
        String path = request.getURI().getPath();
        String query = request.getURI().getQuery();
        String url = path + (query != null ? "?" + query : "");
        String remote = request.getRemoteAddress() != null
                ? request.getRemoteAddress().getAddress().getHostAddress() : "?";

        log.info(">>> [GATEWAY] {} {} from {}", request.getMethod(), url, remote);

        return chain.filter(exchange).doFinally(signal -> {
            long duration = System.currentTimeMillis() - start;
            Integer status = exchange.getResponse().getStatusCode() != null
                    ? exchange.getResponse().getStatusCode().value() : null;
            log.info("<<< [GATEWAY] {} {} -> {} ({} ms)",
                    request.getMethod(), url, status, duration);
        });
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
