package com.restaurant.kitchen.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("HTTP");
    private static final int MAX_PAYLOAD_LENGTH = 2000;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        ContentCachingRequestWrapper req = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper res = new ContentCachingResponseWrapper(response);

        long start = System.currentTimeMillis();
        String query = request.getQueryString();
        String url = request.getRequestURI() + (query != null ? "?" + query : "");

        log.info(">>> [KITCHEN] {} {} from {}", request.getMethod(), url, request.getRemoteAddr());

        try {
            filterChain.doFilter(req, res);
        } finally {
            long duration = System.currentTimeMillis() - start;
            String reqBody = getBody(req.getContentAsByteArray());
            String resBody = getBody(res.getContentAsByteArray());

            if (!reqBody.isBlank()) {
                log.info("    request body: {}", reqBody);
            }
            log.info("<<< [KITCHEN] {} {} -> {} ({} ms)",
                    request.getMethod(), url, res.getStatus(), duration);
            if (!resBody.isBlank() && res.getStatus() >= 400) {
                log.info("    response body: {}", resBody);
            }

            res.copyBodyToResponse();
        }
    }

    private String getBody(byte[] content) {
        if (content == null || content.length == 0) return "";
        int len = Math.min(content.length, MAX_PAYLOAD_LENGTH);
        return new String(content, 0, len, StandardCharsets.UTF_8).replaceAll("\\s+", " ");
    }
}
