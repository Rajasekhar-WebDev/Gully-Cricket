package com.gullyCricket.backend.dto;

public class AuthResponse {
    private String token;
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String name;
    private String role;

    public AuthResponse() {}

    public AuthResponse(String token, String id, String username, String email, String fullName, String role) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.name = fullName != null ? fullName : username;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) {
        this.fullName = fullName;
        this.name = fullName;
    }

    public String getName() { return name != null ? name : fullName; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
