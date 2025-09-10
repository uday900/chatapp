package com.darlachat.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.darlachat.entity.ChatRoomMessage;

public interface ChatMessageRepository extends JpaRepository<ChatRoomMessage, Long> {
	// Custom query methods can be defined here if needed

}
