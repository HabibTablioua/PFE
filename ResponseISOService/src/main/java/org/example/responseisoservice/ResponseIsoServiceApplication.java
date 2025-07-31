package org.example.responseisoservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@ComponentScan(basePackages = {"org.example.responseisoservice"})
public class ResponseIsoServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(ResponseIsoServiceApplication.class, args);
	}

	
	@Bean
	public RestTemplate restTemplate() {

		return new RestTemplate();
	}

}
