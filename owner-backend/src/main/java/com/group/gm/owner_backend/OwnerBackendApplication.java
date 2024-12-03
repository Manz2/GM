package com.group.gm.owner_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
@ComponentScan("com.group.gm")
public class OwnerBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(OwnerBackendApplication.class, args);
    }

}
