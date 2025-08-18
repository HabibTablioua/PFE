FROM openjdk:17-jdk-slim

WORKDIR /app

COPY auth-service2/auth-service2/target/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"] 