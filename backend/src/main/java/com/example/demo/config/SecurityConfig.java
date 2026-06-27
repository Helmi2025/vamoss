package com.example.demo.config;

import com.example.demo.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Public: auth
                .requestMatchers("/api/auth/**").permitAll()
                // Public: captain application form (submitted by unauthenticated visitors)
                .requestMatchers("/api/captain-application/apply").permitAll()
                // Public: player application form (submitted by unauthenticated visitors)
                .requestMatchers("/api/player-application/apply").permitAll()
                // Public: sport list + icon streaming (browser img tags cannot send JWT)
                .requestMatchers("/api/sports/**").permitAll()
                // Public: team logo streaming (browser img tags cannot send JWT)
                .requestMatchers("/api/captain/team/logo/**").permitAll()
                // Public: visitor view — matches, stats, tournaments, fields (read-only)
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/matches/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/stats/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/tournaments").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/tournaments/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/fields/**").permitAll()
                // Allow Spring's error endpoint so exception responses reach the client
                .requestMatchers("/error").permitAll()
                // WebSocket handshake endpoint
                .requestMatchers("/ws/**").permitAll()
                // Admin-only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Captain-only endpoints
                .requestMatchers("/api/captain/**").hasRole("CAPTAIN")
                // Player-only endpoints
                .requestMatchers("/api/player/**").hasRole("PLAYER")
                // Referee-only endpoints
                .requestMatchers("/api/referee/**").hasRole("REFEREE")
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .sessionManagement(sess ->
                sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** Global CORS — must be registered here so Spring Security evaluates it before auth. */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
