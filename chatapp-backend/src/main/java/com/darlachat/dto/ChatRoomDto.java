package com.darlachat.dto;

import com.darlachat.enums.ChatRoomType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class ChatRoomDto {

    private Long chatRoomId;

    private String chatName;

    private ChatRoomType chatRoomType;

    private String profilePicture = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s";

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private ChatMessageDto lastMessage;

    private Long unreadCount = 0L;

}
