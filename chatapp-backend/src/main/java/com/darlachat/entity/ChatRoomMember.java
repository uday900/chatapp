package com.darlachat.entity;

import lombok.*;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "chat_room_members")
@Data
@NoArgsConstructor
public class ChatRoomMember {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "chat_room_id", nullable = false)
	private ChatRoom chatRoom;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private AppUser user;

	private boolean admin;
	
	private LocalDateTime joinedAt;

	private LocalDateTime leftAt;

	private LocalDateTime chatClearedAt;

	public ChatRoomMember(AppUser user) {
		this.user = user;
		this.joinedAt = LocalDateTime.now();
	}
}
