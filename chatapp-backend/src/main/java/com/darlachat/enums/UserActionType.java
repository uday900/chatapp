package com.darlachat.enums;

import lombok.Getter;

@Getter
public enum UserActionType {
	ONLINE("Online"),
	OFFLINE("Offline"),
	AWAY("Away"),
	DND("Do Not Disturb"),
	TYPING("Typing"),
	MESSAGE_DELETED("Message Deleted"),
	MESSAGE_RECEIVED("Message Received"),
	MESSAGE_SEEN("Message Seen"),
	CHAT_CLEARED("Chat Cleared");

	private final String label;

	UserActionType(String string) {
		this.label = string;
    }
	


}