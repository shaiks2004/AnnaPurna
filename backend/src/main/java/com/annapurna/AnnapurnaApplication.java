package com.annapurna;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.annapurna")
@EnableJpaRepositories(basePackages = "com.annapurna")
public class AnnapurnaApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnnapurnaApplication.class, args);
    }
}
