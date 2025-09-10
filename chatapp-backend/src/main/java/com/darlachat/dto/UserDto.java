package com.darlachat.dto;

import java.time.LocalDateTime;

import com.darlachat.validations.ValidSendMessage;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserDto {

	@NotNull(message = "sender id is required", groups = ValidSendMessage.class)
	private Long id;

	private String username;

	private String password;

	private String email;

	private String firstName;
	
	private String lastName;
	
	private String profilePicture;
	
	private LocalDateTime createdDate;

}
