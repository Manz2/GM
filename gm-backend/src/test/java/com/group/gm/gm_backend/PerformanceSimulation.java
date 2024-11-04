package com.group.gm.gm_backend;

import io.gatling.javaapi.core.ScenarioBuilder;
import io.gatling.javaapi.core.Simulation;
import io.gatling.javaapi.http.HttpProtocolBuilder;

import java.time.Duration;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.core.OpenInjectionStep.atOnceUsers;
import static io.gatling.javaapi.http.HttpDsl.http;
import static io.gatling.javaapi.http.internal.HttpCheckBuilders.status;

public class PerformanceSimulation extends Simulation {

    HttpProtocolBuilder httpProtocol = http
            .baseUrl("https://gm-frontend-staging-563205931618.europe-west1.run.app")
            .acceptHeader("application/json")
            .userAgentHeader("Gatling Performance Test");

    // Standard-Nutzer-Szenario
    ScenarioBuilder scn = scenario("Standard User Scenario")
            .exec(
                    http("Get Request")
                            .get("/defects") // Ersetze dies durch den tatsächlichen Endpunkt
                            .check(status().is(200))
            );// Pause zwischen den Requests

    // Load Test Setup
    {
        setUp(
                scn.injectOpen(
                        // Ramp up users over 30 seconds, then hold for 30 seconds
                        rampUsers(500).during(300),
                        // Hold the users for 30 seconds
                        nothingFor(Duration.ofSeconds(300)),
                        // Ramp down users to 0 over 30 seconds
                        rampUsers(0).during(300)
                ).protocols(httpProtocol)
        ).maxDuration(Duration.ofMinutes(10));
    }
}

