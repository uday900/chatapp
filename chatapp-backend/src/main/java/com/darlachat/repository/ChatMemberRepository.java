package com.darlachat.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.darlachat.entity.ChatRoomMember;

public interface ChatMemberRepository extends JpaRepository<ChatRoomMember, Long> {

}
