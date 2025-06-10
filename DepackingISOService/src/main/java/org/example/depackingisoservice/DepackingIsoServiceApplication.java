package org.example.depackingisoservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class DepackingIsoServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DepackingIsoServiceApplication.class, args);
    }

}
