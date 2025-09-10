package com.darlachat.entity;

import com.darlachat.common.Auditable;
import com.darlachat.enums.MessageStatus;
import jakarta.persistence.*;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "messages")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoomMessage extends Auditable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String message;
	
	private MessageStatus status;

	private LocalDateTime seenAt;

	private LocalDateTime deliveredAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sender_id", nullable = false)
	private AppUser sender;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "chat_room_id", nullable = false)
	private ChatRoom chatRoom;

}
