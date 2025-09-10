package com.darlachat.dto;

import com.darlachat.enums.UserActionType;
import lombok.Data;

@Data
public class UserAction {
    private Long userId;
    private String userRole;

    private Long messageId;

    private Long chatRoomId;

    private UserActionType actionType;
}
