package com.darlachat.controller;

import java.util.HashMap;
import java.util.Map;

import com.darlachat.dto.ChatInitRequest;
import com.darlachat.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.darlachat.common.ApiEndpoints;
import com.darlachat.common.ApiResponse;
import com.darlachat.exceptions.ExceptionLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static com.darlachat.common.ApiEndpoints.BASE_CHAT;;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping(BASE_CHAT)
@Tag(name = "Chat API's", description = "Operations related to chat rooms & their messages")
public class ChatController {

	private final ExceptionLogService exceptionLogService;
    private final ChatService chatService;

    @Operation(summary = "Create or get chat room", description = "Creates a new chat room or returns an existing one")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Chat room created"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrGetChat(
            @RequestBody ChatInitRequest chatInitRequest
    ) throws Exception {
        Map<String, Object> dataMap = new HashMap<>();
        String apiMessage = "Resource created successfully";
        try {
            dataMap.put("chatRoom", chatService.createOrGetChat(chatInitRequest));
        } catch (Exception ex) {
        	exceptionLogService.saveException(ex, "POST: " + BASE_CHAT);
        }
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.setSuccess(dataMap, apiMessage, HttpStatus.CREATED, ApiEndpoints.V1));
    }


    @Operation(summary = "Add user to existing chat room", description = "Adds a user to an existing chat room")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User added to chat room"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Chat room not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/add-user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addUserToChat(
            @RequestParam("chatRoomId") Long chatRoomId,
            @RequestParam("userId") Long userId
    ) throws Exception {
        Map<String, Object> dataMap = new HashMap<>();
        String apiMessage = "User added to chat room successfully";
        try {
            dataMap.put("userAdded", chatService.addUserToChatRoom(chatRoomId, userId));
        } catch (Exception ex) {
            exceptionLogService.saveException(ex, "POST: " + BASE_CHAT + "/add-user");
        }
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.setSuccess(dataMap, apiMessage, HttpStatus.OK, ApiEndpoints.V1));
    }

    @Operation(summary = "Remove user from chat room", description = "Removes a user from an existing chat room")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User removed from chat room"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Chat room or user not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Server error") })
    @DeleteMapping("/remove-user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> removeUserFromChat(
            @RequestParam("chatRoomId") Long chatRoomId,
            @RequestParam("userId") Long userId ) throws Exception
    {
        Map<String, Object> dataMap = new HashMap<>();
        String apiMessage = "User removed from chat room successfully";
        try {
            dataMap.put("userRemoved", chatService.removeUserFromChatRoom(chatRoomId, userId));
        } catch (Exception ex) {
            exceptionLogService.saveException(ex, "DELETE: " + BASE_CHAT + "/remove-user");
        }
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.setSuccess(dataMap, apiMessage, HttpStatus.OK, ApiEndpoints.V1));
    }

    @Operation(summary = "Get user chats", description = "Fetches all chat rooms for a given user")
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserChats(
            @RequestParam("userId") Long userId) throws Exception {

        Map<String, Object> dataMap = new HashMap<>();
        String apiMessage = "Chats fetched successfully";

        try {
            dataMap.put("chats", chatService.getAllChatsForUser(userId));
        } catch (Exception ex) {
            exceptionLogService.saveException(ex, "GET: " + BASE_CHAT);
        }
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.setSuccess(dataMap, apiMessage, HttpStatus.OK, ApiEndpoints.V1));
    }

    @Operation(summary = "Get chat members", description = "Fetches all users in a given chat room")
    @GetMapping("/members")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllUsersInChatRoom(
            @RequestParam("chatRoomId") Long chatRoomId) throws Exception {

        Map<String, Object> dataMap = new HashMap<>();
        String apiMessage = "Chat members fetched successfully";

        try {
            dataMap.put("members", chatService.getAllUsersInChatRoom(chatRoomId));
        } catch (Exception ex) {
            exceptionLogService.saveException(ex, "GET: " + BASE_CHAT + "/members");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.setSuccess(dataMap, apiMessage, HttpStatus.OK, ApiEndpoints.V1));
    }

    @Operation(summary = "Get chat messages", description = "Fetches all messages in a chat room")
    @GetMapping("/{chatRoomId}/messages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMessages(
            @PathVariable Long chatRoomId,
            @RequestParam(defaultValue = "0", required = false) int page,
            @RequestParam(defaultValue = "20", required = false) int size) throws Exception {

        Map<String, Object> dataMap = new HashMap<>();
        String apiMessage = "Messages fetched successfully";
        try {
            dataMap.put("messages", chatService.getMessages(chatRoomId, page, size));
        } catch (Exception ex) {
            exceptionLogService.saveException(ex, "GET: " + BASE_CHAT + "/" + chatRoomId + "/messages");
        }
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.setSuccess(dataMap, apiMessage, HttpStatus.OK, ApiEndpoints.V1));
    }






}
