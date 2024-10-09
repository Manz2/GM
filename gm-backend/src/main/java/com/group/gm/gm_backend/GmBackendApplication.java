package com.group.gm.gm_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan("com.group.gm")
public class GmBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(GmBackendApplication.class, args);
	}

}
