package com.darlachat.common;

/**
 * Simple API Endpoints with Version Support
 * Maintains endpoints for v1 and v2 API versions
 */
public class ApiEndpoints {

    // API Versions
    public static final String V1 = "/api/v1";
    public static final String V2 = "/api/v2";

    // Auth endpoints
    public static final String LOGIN = V1 + "/auth/login";
    public static final String REGISTER = V1 + "/auth/register";
    public static final String LOGOUT = V1 + "/auth/logout";
    
    // user
    public static final String BASE_USER = V1 + "/user";
    
    // chat
    public static final String BASE_CHAT = V1 + "/chat";
    

}
