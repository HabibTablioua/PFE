package com.example.auth_service2;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient

@SpringBootApplication

public class AuthService2Application {

	public static void main(String[] args) {
		SpringApplication.run(AuthService2Application.class, args);
	}

}
