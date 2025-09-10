package com.darlachat.controller;

import com.darlachat.dto.ChatMessageDto;
import com.darlachat.dto.UserAction;
import com.darlachat.entity.AppUser;
import com.darlachat.entity.ChatRoom;
import com.darlachat.entity.ChatRoomMember;
import com.darlachat.entity.ChatRoomMessage;
import com.darlachat.enums.MessageStatus;
import com.darlachat.exceptions.RecordNotFoundException;
import com.darlachat.mapper.UserMapper;
import com.darlachat.service.ChatService;
import com.darlachat.service.UserPresenceService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@RequiredArgsConstructor
@Controller
@Slf4j
public class ChatSocketApis {

    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final UserPresenceService userPresenceService;

    @Transactional
    @MessageMapping("/send/message")
    public void sendMessage(@Payload ChatMessageDto messageDto) {

        log.info("Received message: {}", messageDto);

        // validate chat room and sender
        ChatRoom chat = chatService.getById(messageDto.getChatRoomId())
                .orElseThrow(() -> new RecordNotFoundException("Chat room not found"));
//        Hibernate.initialize(chat.getChatRoomMembers());
        AppUser appUser = chat.getChatRoomMembers().stream()
                .map(ChatRoomMember::getUser)
                .filter(user -> user.getId().equals(messageDto.getSender().getId()))
                .findFirst()
                .orElseThrow(() -> new RecordNotFoundException("Sender not part of this chat room"));
        messageDto.setSender(UserMapper.toUserDto(appUser));
        // send message to specific user or group
        messagingTemplate.convertAndSend("/topic/chatroom/" + messageDto.getChatRoomId(), messageDto);

        // saving message to DB can be done here or in a service layer
        chatService.saveMessage(ChatRoomMessage.builder()
                        .message(messageDto.getMessage())
                        .sender(appUser)
                        .chatRoom(chat)
                        .status(MessageStatus.SENT)
                .build());
    }

    @MessageMapping("/user/actions")
    public void userActions(@Payload UserAction action) {
        log.info("Received user action: {}", action);
        switch (action.getActionType()) {
            case ONLINE -> userPresenceService.setOnline(action.getUserId());
            case TYPING -> messagingTemplate.convertAndSend("/topic/chatroom/", action.getChatRoomId());
            case MESSAGE_DELETED -> {
                chatService.softDeleteMessage(action.getMessageId(), action.getUserId());

                // notify all members in that chatroom that a message was deleted
                messagingTemplate.convertAndSend(
                        "/topic/chatroom/" + action.getChatRoomId(),
                        action
                );
            }
            case CHAT_CLEARED -> {
                chatService.clearChatHistory(action.getChatRoomId(), action.getUserId());

                // notify all members in that chatroom that chat was cleared
                messagingTemplate.convertAndSend(
                        "/topic/chatroom/" + action.getChatRoomId(),
                        action
                );
            }
            case MESSAGE_RECEIVED -> {
                chatService.updateMessageStatus(action.getMessageId(), MessageStatus.DELIVERED);
                // notify sender that message was delivered
                messagingTemplate.convertAndSend(
                        "/topic/chatRoom/" + action.getChatRoomId(),
                        action
                );
            }
            case MESSAGE_SEEN -> {
                chatService.updateMessageStatus(action.getMessageId(), MessageStatus.SEEN);
                // notify sender that message was seen
                messagingTemplate.convertAndSend(
                        "/topic/chatRoom/" + action.getChatRoomId(),
                        action
                );
            }
            case DND -> {}
            case AWAY -> {}
            default -> userPresenceService.setOffline(action.getUserId());
        }
    }
}
