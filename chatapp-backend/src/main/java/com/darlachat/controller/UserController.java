package com.darlachat.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.darlachat.dto.ChatInitRequest;
import com.darlachat.entity.ChatRoomMessage;
import com.darlachat.enums.ChatRoomType;
import com.darlachat.enums.MessageStatus;
import com.darlachat.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.darlachat.common.ApiResponse;
import com.darlachat.dto.UserDto;
import com.darlachat.entity.AppUser;
import com.darlachat.exceptions.ExceptionLogService;
import com.darlachat.service.UserService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static com.darlachat.common.ApiEndpoints.BASE_USER;
import static com.darlachat.mapper.UserMapper.toAppUser;
import static com.darlachat.mapper.UserMapper.toUserDto;
import static com.darlachat.mapper.UserMapper.toUserDtoList;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping(BASE_USER)
public class UserController {
	
	private final ExceptionLogService exceptionLogService;
	private final UserService userService;
    private final ChatService chatService;
	
	@PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createResource(
    		@RequestBody UserDto userDto) throws Exception {
        Map<String, Object> dataMap = new HashMap<>();
        String apiMessage = "Resource created successfully";
        log.info("Creating new blueprint resource");
        try {
        	AppUser appUser = userService.create(toAppUser(userDto));
            dataMap.put("user", toUserDto(appUser));
        } catch (Exception ex) {
        	exceptionLogService.saveException(ex, BASE_USER);
        }
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.setSuccess(dataMap, apiMessage, HttpStatus.CREATED, BASE_USER));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getResource() throws Exception {
        Map<String, Object> dataMap = new HashMap<>();
        String apiMessage = "Resource fetched successfully";
        try {
        	List<AppUser> appUsers = userService.getAll();
            dataMap.put("user", toUserDtoList(appUsers));
        } catch (Exception ex) {
            // Handle exception here
        	exceptionLogService.saveException(ex, BASE_USER);
        }
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.setSuccess(dataMap, apiMessage, HttpStatus.OK, BASE_USER));
    }
    
    /**
     * Endpoint to seed database with dummy users
     */
    @Operation(summary = "Seed Dummy Users",
            description = "insert 5 dummy users, chat initiaation for group of 1,2, 4 users & individual chat between 2, 5 users")
    @PostMapping("/seed")
    public ResponseEntity<ApiResponse<Map<String, Object>>> seedUsers() throws Exception {
        Map<String, Object> dataMap = new HashMap<>();
        String apiMessage = "Dummy users created successfully";
        try {
            List<AppUser> dummyUsers = Arrays.asList(
                AppUser.builder()
                        .username("john.doe@example.com")
                        .password("password123")
                        .firstName("Uday")
                        .lastName("Doe")
                        .profilePicture("https://randomuser.me/api/portraits/men/10.jpg")
                        .build(),
                AppUser.builder()
                        .username("jane.smith@example.com")
                        .password("password123")
                        .firstName("Sivaji")
                        .lastName("Smith")
                        .profilePicture("https://randomuser.me/api/portraits/women/20.jpg")
                        .build(),
                AppUser.builder()
                        .username("michael.brown@example.com")
                        .password("password123")
                        .firstName("Samba")
                        .lastName("Brown")
                        .profilePicture("https://randomuser.me/api/portraits/men/30.jpg")
                        .build(),
                AppUser.builder()
                        .username("emily.davis@example.com")
                        .password("password123")
                        .firstName("Emily")
                        .lastName("Davis")
                        .profilePicture("https://randomuser.me/api/portraits/women/40.jpg")
                        .build(),
                AppUser.builder()
                        .username("chris.johnson@example.com")
                        .password("password123")
                        .firstName("Meghana")
                        .lastName("Johnson")
                        .profilePicture("https://randomuser.me/api/portraits/men/50.jpg")
                        .build()
            );

            // save all users
            dummyUsers.forEach(userService::create);

            ChatInitRequest chatInitRequest = new ChatInitRequest();
            chatInitRequest.setChatMembers(List.of(1L, 2L, 4L));
            chatInitRequest.setChatRoomType(ChatRoomType.GROUP);
            chatInitRequest.setChatName("Group Chat");
            chatInitRequest.setProfilePicture("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s");
            chatService.createOrGetChat(chatInitRequest);

            chatInitRequest.setChatMembers(List.of(1L, 5L));
            chatInitRequest.setChatRoomType(ChatRoomType.INDIVIDUAL);
            chatService.createOrGetChat(chatInitRequest);


            chatService.saveMessage(ChatRoomMessage.builder()
                    .message("Hello all, this is Uday")
                    .sender( userService.getById(1L).orElseThrow())
                    .chatRoom(chatService.getById(1L).orElseThrow())
                    .status(MessageStatus.SEEN)
                    .build());

            chatService.saveMessage(ChatRoomMessage.builder()
                    .message("Hello Uday, this is Sivaji")
                    .sender( userService.getById(2L).orElseThrow())
                    .chatRoom(chatService.getById(1L).orElseThrow())
                    .status(MessageStatus.SEEN)
                    .build());

            dataMap.put("users", "created 5 dummy users successfully");
            dataMap.put("chat", "chat initiation for group of 1,2, 4 users & individual chat between 2, 5 users");
            dataMap.put("message", "sample messages for group chat between 1,2,4 users");

        } catch (Exception ex) {
            exceptionLogService.saveException(ex, BASE_USER + "/seed");
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.setSuccess(dataMap, apiMessage, HttpStatus.CREATED, BASE_USER + "/seed"));
    }


}
