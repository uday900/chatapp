package com.darlachat.entity;

import java.util.ArrayList;
import java.util.List;

import com.darlachat.common.Auditable;
import com.darlachat.enums.ChatRoomType;
import jakarta.persistence.*;

import lombok.Data;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "users_chat")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoom extends Auditable {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	private ChatRoomType chatRoomType;

	private String chatName; // for groups

	private String profilePicture;

	@OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
	private List<ChatRoomMember> chatRoomMembers = new ArrayList<>();

	@OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
	private List<ChatRoomMessage> chatRoomMessages = new ArrayList<>();

	public void addChatRoomMember(ChatRoomMember chatRoomMember) {
		this.getChatRoomMembers().add(chatRoomMember);
		chatRoomMember.setChatRoom(this);
	}

	public void removeChatRoomMember(ChatRoomMember chatRoomMember) {
		this.getChatRoomMembers().remove(chatRoomMember);
		chatRoomMember.setChatRoom(null);
	}

}
