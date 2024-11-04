package com.group.gm.gm_backend;

import io.gatling.javaapi.core.ScenarioBuilder;
import io.gatling.javaapi.core.Simulation;
import io.gatling.javaapi.http.HttpProtocolBuilder;

import java.time.Duration;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.http;
import static io.gatling.javaapi.http.internal.HttpCheckBuilders.status;

public class PerformanceSimulation extends Simulation {

    HttpProtocolBuilder httpProtocol = http
            .baseUrl("https://gm-backend-prod-563205931618.europe-west1.run.app")
            //.baseUrl("http://localhost:8081")
            .acceptHeader("application/json")
            .shareConnections()
            .disableCaching()
            .userAgentHeader("Gatling Performance Test");


//    ScenarioBuilder peakLoadScn = scenario("On Time Peak Workload")
//            .repeat(60) // Endlose Wiederholung des folgenden Blocks
//            .on(
//                    exec(
//                            http("Get Request")
//                                    .get("/api/defects") // Ersetze dies durch den tatsächlichen Endpunkt
//                                    .check(status().is(200))
//                    )
//                            .pause(Duration.ofSeconds(1)) // Pause von 1 Sekunde zwischen den Anfragen
//            );
//
//    {
//        setUp(
//                peakLoadScn.injectOpen(
//                        // Ramp up: 100 Benutzer pro Sekunde für 30 Sekunden
//                        rampUsers(1000).during(Duration.ofSeconds(30)), // 300 Benutzer über 30 Sekunden hochfahren
//                        // Halte die Last für 1 Minute
//                        nothingFor(Duration.ofMinutes(1)),
//                ).protocols(httpProtocol)
//        ).maxDuration(Duration.ofMinutes(3)); // Maximale Dauer des Tests
//    }



    ScenarioBuilder changingLoadScn = scenario("Constantly Changing Workload")
            .repeat(60) // Endlose Wiederholung des folgenden Blocks
            .on(
                    exec(
                            http("Get Request")
                                    .get("/api/defects") // Ersetze dies durch den tatsächlichen Endpunkt
                                    .check(status().is(200))
                    )
                            .pause(Duration.ofSeconds(1)) // Pause von 1 Sekunde zwischen den Anfragen
            );

    {
        setUp(
                changingLoadScn.injectOpen(
                        // Zunächst 50 Benutzer pro Sekunde für 1 Minute
                        atOnceUsers(50),
                        constantUsersPerSec(5).during(Duration.ofMinutes(1)),
                        constantUsersPerSec(10).during(Duration.ofMinutes(1)),
                        // Dann ansteigend auf 100 Benutzer pro Sekunde für 1 Minute
                        constantUsersPerSec(50).during(Duration.ofSeconds(10)),
                        // Schließlich einen Rückgang auf 20 Benutzer pro Sekunde für 2 Minuten
                        constantUsersPerSec(20).during(Duration.ofSeconds(30))
                ).protocols(httpProtocol)
        ).maxDuration(Duration.ofMinutes(5)); // Maximale Dauer des Tests
    }
}

