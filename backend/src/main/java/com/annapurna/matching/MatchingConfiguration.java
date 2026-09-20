package com.annapurna.matching;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(BaselineMatchWeights.class)
public class MatchingConfiguration {
}
