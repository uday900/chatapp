package com.darlachat.dto;

import java.time.LocalDateTime;

import com.darlachat.enums.MessageStatus;

import com.darlachat.validations.ValidSendMessage;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import static com.darlachat.util.TimeUtil.getFormattedTime;

@Data
public class ChatMessageDto {

	private Long messageId;

	@NotNull(message = "Message content cannot be null", groups = ValidSendMessage.class)
	private String message;

	@NotNull(message = "sender cannot be null", groups = ValidSendMessage.class)
	private UserDto sender;

	private MessageStatus status;

	private LocalDateTime createdDate;

	@NotNull(message = "Chat id is required", groups = ValidSendMessage.class)
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private Long chatRoomId;


	@JsonProperty("createdAt")
	public String formatCreatedDate() {
		return createdDate != null ? getFormattedTime(createdDate) : null;
	}

}
