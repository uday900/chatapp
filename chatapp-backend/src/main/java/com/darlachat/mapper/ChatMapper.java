package com.darlachat.mapper;

import com.darlachat.dto.ChatInitRequest;
import com.darlachat.dto.ChatMessageDto;
import com.darlachat.dto.ChatRoomDto;
import com.darlachat.entity.ChatRoom;
import com.darlachat.entity.ChatRoomMember;
import com.darlachat.entity.ChatRoomMessage;
import com.darlachat.enums.ChatRoomType;
import com.darlachat.enums.MessageStatus;

import java.util.Comparator;

public class ChatMapper {
	
	public static ChatRoom toChatRoom(ChatInitRequest chatInitRequest) {
		ChatRoom chatRoom = new ChatRoom();
		chatRoom.setChatName(chatInitRequest.getChatName());
		chatRoom.setChatRoomType(chatInitRequest.getChatRoomType());
		chatRoom.setProfilePicture(chatInitRequest.getProfilePicture());
		return chatRoom;
	}

	public static ChatRoomDto toChatRoomDto(ChatRoom chatRoom, Long currentUserId) {
		ChatRoomDto chatRoomDto = new ChatRoomDto();
		chatRoomDto.setChatRoomId(chatRoom.getId());
		chatRoomDto.setChatName(chatRoom.getChatName());
		if (chatRoom.getChatRoomType().equals(ChatRoomType.INDIVIDUAL)) {
			String userName = chatRoom.getChatRoomMembers().stream()
					.map(ChatRoomMember::getUser)
					.filter(user -> !user.getId().equals(currentUserId))
					.findFirst()
					.map(user -> user.getFirstName() + " " + user.getLastName())
					.orElse("Unknown User");
			chatRoomDto.setChatName(userName);
		}
		chatRoomDto.setChatRoomType(chatRoom.getChatRoomType());
		chatRoomDto.setProfilePicture(chatRoom.getProfilePicture());
		// Set last message
		chatRoom.getChatRoomMessages().stream()
				.max(Comparator.comparing(ChatRoomMessage::getCreatedDate))
				.ifPresent(lastMessage -> chatRoomDto.setLastMessage(toChatMessageDto(lastMessage)));

		chatRoomDto.setUnreadCount(chatRoom.getChatRoomMessages()
				.stream()
				.filter(message -> {
					MessageStatus messageStatus = message.getStatus();
					return messageStatus.equals(MessageStatus.DELIVERED);
				}).count());
		return chatRoomDto;
	}

	public static ChatMessageDto toChatMessageDto(ChatRoomMessage chatRoomMessage) {
		ChatMessageDto chatMessageDto = new ChatMessageDto();
		chatMessageDto.setMessageId(chatRoomMessage.getId());
		chatMessageDto.setSender(UserMapper.toUserDto(chatRoomMessage.getSender()));
		chatMessageDto.setMessage(chatRoomMessage.getMessage());
		chatMessageDto.setCreatedDate(chatRoomMessage.getCreatedDate());
		return chatMessageDto;
	}

}
