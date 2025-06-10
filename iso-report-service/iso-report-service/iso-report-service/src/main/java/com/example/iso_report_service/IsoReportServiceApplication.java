package com.example.iso_report_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Collections;

@SpringBootApplication
public class IsoReportServiceApplication {
	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(IsoReportServiceApplication.class);
		app.setDefaultProperties(Collections.singletonMap("server.port", "8090"));
		app.run(args);
	}
}

