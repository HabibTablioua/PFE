package org.example.authservice.DTO;

public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String role;

    // ✅ Constructeur avec les 3 champs
    public AuthResponse(String accessToken, String refreshToken, String role) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.role = role;
    }

    // ✅ Constructeur par défaut (obligatoire pour Jackson ou frameworks)
    public AuthResponse() {}

    // ✅ Getters
    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getRole() {
        return role;
    }

    // ✅ Setters
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
