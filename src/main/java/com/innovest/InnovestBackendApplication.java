package com.innovest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class InnovestBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(InnovestBackendApplication.class, args);
	}

}
