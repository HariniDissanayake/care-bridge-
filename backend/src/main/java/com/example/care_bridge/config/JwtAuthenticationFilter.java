package com.example.care_bridge.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Fail early if the authorization header is missing or malformed
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            userEmail = jwtService.extractEmail(jwt);
            String role = jwtService.extractRole(jwt);

            // ─── DEBUG LOGGING (remove after fix is confirmed) ───────────────
            System.out.println("==========================================");
            System.out.println("[JWT DEBUG] Request URL : " + request.getRequestURI());
            System.out.println("[JWT DEBUG] Email       : " + userEmail);
            System.out.println("[JWT DEBUG] Role raw    : " + role);
            System.out.println("[JWT DEBUG] Token valid : " + jwtService.isTokenValid(jwt, userEmail));
            // ─────────────────────────────────────────────────────────────────

            // 2. Authenticate if token maps to an email and context is not yet set
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                if (jwtService.isTokenValid(jwt, userEmail)) {

                    // Ensure ROLE_ prefix exists — never duplicate it
                    String finalRole = (role != null && role.startsWith("ROLE_"))
                            ? role
                            : "ROLE_" + (role != null ? role.toUpperCase() : "UNKNOWN");

                    // ─── DEBUG LOGGING ────────────────────────────────────────
                    System.out.println("[JWT DEBUG] Final role  : " + finalRole);
                    System.out.println("[JWT DEBUG] Auth granted: true");
                    System.out.println("==========================================");
                    // ─────────────────────────────────────────────────────────

                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority(finalRole);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userEmail,
                                    null,
                                    Collections.singletonList(authority)
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // 3. Grant this request green-light clearance in Spring Security
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                } else {
                    // ─── DEBUG LOGGING ────────────────────────────────────────
                    System.out.println("[JWT DEBUG] Token INVALID — auth not set");
                    System.out.println("==========================================");
                    // ─────────────────────────────────────────────────────────
                }
            }

        } catch (Exception e) {
            System.out.println("[JWT DEBUG] Exception in filter: " + e.getMessage());
            this.logger.error("Could not set user security context: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}