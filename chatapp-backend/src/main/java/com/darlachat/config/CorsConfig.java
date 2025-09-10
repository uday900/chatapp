package com.darlachat.config;

import lombok.extern.slf4j.Slf4j;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
//@Slf4j
public class CorsConfig implements WebMvcConfigurer {
	
    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        log.info("Allowing all origins via pattern.");
        registry
                .addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*");
//                .allowCredentials(true);
    }

}
