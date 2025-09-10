package com.darlachat.dto;

import com.darlachat.enums.ChatRoomType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatInitRequest {
    private Long chatRoomId;
    private String chatName;

    @NotNull(message = "Chat room type cannot be null")
    private ChatRoomType chatRoomType;
    private String profilePicture = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s";

    @NotNull(message = "Chat members cannot be null")
    @Size(min = 2, message = "At least two members are required to create a chat room")
    private List<Long> chatMembers;
}
