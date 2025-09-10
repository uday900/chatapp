package com.darlachat.service;

import com.darlachat.common.service.CrudService;
import com.darlachat.dto.ChatInitRequest;
import com.darlachat.dto.ChatMessageDto;
import com.darlachat.dto.ChatRoomDto;
import com.darlachat.dto.UserDto;
import com.darlachat.entity.AppUser;
import com.darlachat.entity.ChatRoom;
import com.darlachat.entity.ChatRoomMember;
import com.darlachat.entity.ChatRoomMessage;
import com.darlachat.enums.ChatRoomType;
import com.darlachat.enums.MessageStatus;
import com.darlachat.exceptions.RecordNotFoundException;
import com.darlachat.mapper.ChatMapper;
import com.darlachat.repository.ChatMessageRepository;
import com.darlachat.repository.ChatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.Objects.nonNull;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService implements CrudService<ChatRoom, Long> {

	private final ChatRepository chatRepository;
	private final UserService userService;
	private final ChatMessageRepository chatMessageRepository;

	@Transactional
	public ChatRoomDto createOrGetChat(ChatInitRequest chatInitRequest) {
		// check if chat room already exists between the two users
		if (chatInitRequest.getChatRoomType().equals(ChatRoomType.INDIVIDUAL)) {
			ChatRoom existingChatRoom = chatRepository.findIndividualChatRoomBetweenUsers(
					chatInitRequest.getChatMembers().get(0), chatInitRequest.getChatMembers().get(1));
			if (nonNull(existingChatRoom)) {
				log.info("Individual chat room already exists between users {} and {}. Returning existing chat room.",
						chatInitRequest.getChatMembers().get(0), chatInitRequest.getChatMembers().get(1));
				return ChatMapper.toChatRoomDto(existingChatRoom, null);
			}
		}

		if (nonNull(chatInitRequest.getChatRoomId())) {
			// will implement later
			ChatRoom chatRoom = chatRepository.findById(chatInitRequest.getChatRoomId())
					.orElseThrow(() -> new RecordNotFoundException("Chat room not found with ID: " + chatInitRequest.getChatRoomId()));
			return ChatMapper.toChatRoomDto(chatRoom, null);
		}

		ChatRoom chatRoom = ChatMapper.toChatRoom(chatInitRequest);
		chatInitRequest.getChatMembers().forEach(userId -> {
			AppUser user = userService.getById(userId)
					.orElseThrow(() -> new RecordNotFoundException("User not found with ID: " + userId));
            chatRoom.addChatRoomMember(new ChatRoomMember(user));
			log.info("Adding user {} to chat room {}", user.getId(), chatRoom.getId());
		});

		return ChatMapper.toChatRoomDto(chatRepository.save(chatRoom), null);
	}

	public boolean addUserToChatRoom(Long chatRoomId, Long userId) {
		ChatRoom chatRoom = chatRepository.findById(chatRoomId)
				.orElseThrow(() -> new RecordNotFoundException("Chat room not found with ID: " + chatRoomId));
		AppUser user = userService.getById(userId)
				.orElseThrow(() -> new RecordNotFoundException("User not found with ID: " + userId));
		if (chatRoom.getChatRoomMembers().stream().anyMatch(member -> member.getUser().getId().equals(userId))) {
			log.info("User {} is already a member of chat room {}", userId, chatRoomId);
			return false; // User already in chat room
		}
		chatRoom.addChatRoomMember(new ChatRoomMember(user));
		chatRepository.save(chatRoom);
		return true;
	}

	public boolean removeUserFromChatRoom(Long chatRoomId, Long userId) {
		ChatRoom chatRoom = chatRepository.findById(chatRoomId)
				.orElseThrow(() -> new RecordNotFoundException("Chat room not found with ID: " + chatRoomId));
		ChatRoomMember roomMember = chatRoom.getChatRoomMembers()
				.stream()
				.filter(chatRoomMember -> chatRoomMember.getUser().getId().equals(userId))
				.findFirst()
				.orElseThrow(() -> new RecordNotFoundException("User not found in chat room with ID: " + userId));
		chatRoom.removeChatRoomMember(roomMember);
		chatRepository.save(chatRoom);
		return true;
	}

	public void saveMessage(ChatRoomMessage chatRoomMessage) {
		chatMessageRepository.save(chatRoomMessage);
		log.info("Chat message saved with ID: {}", chatRoomMessage.getId());
	}

	@Override
	public Optional<ChatRoom> getById(Long aLong) {
		return chatRepository.findById(aLong);
	}

	public List<ChatRoomDto> getAllChatsForUser(Long userId) {
		List<ChatRoom> chatRooms = chatRepository.findChatsByUserId(userId);
		return chatRooms.stream()
				.map(chatRoom -> ChatMapper.toChatRoomDto(chatRoom, userId))
				.collect(Collectors.toList());
	}

	public List<UserDto> getAllUsersInChatRoom(Long chatRoomId) {
		// TODO: implement in future
		return List.of();
	}

	public List<ChatMessageDto> getMessages(Long chatRoomId, int page, int size) {
		ChatRoom chat = getById(chatRoomId).orElseThrow(() -> new RecordNotFoundException("Chat room not found"));
		return chat.getChatRoomMessages().stream().map(ChatMapper::toChatMessageDto).toList();
	}

	public void softDeleteMessage(Long messageId, Long userId) {
		// TODO: implement soft delete logic
	}

	public void clearChatHistory(Long chatRoomId, Long userId) {
		// TODO: implement clear chat history logic
	}

	public void updateMessageStatus(Long messageId, MessageStatus messageStatus) {
		// TODO: implement update message status logic
	}
}
