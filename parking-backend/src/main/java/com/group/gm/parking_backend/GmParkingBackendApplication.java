package com.group.gm.parking_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
@ComponentScan("com.group.gm")
public class GmParkingBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(GmParkingBackendApplication.class, args);
    }

}
