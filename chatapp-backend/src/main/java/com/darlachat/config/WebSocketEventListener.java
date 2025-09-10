package com.darlachat.config;

import com.darlachat.service.UserPresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@RequiredArgsConstructor
public class WebSocketEventListener implements ApplicationListener<SessionDisconnectEvent> {

    private final UserPresenceService userPresenceService;
    private final SimpMessagingTemplate messagingTemplate;


    @Override
    public void onApplicationEvent(SessionDisconnectEvent event) {
        // TODO: Handle user disconnect logic
    }
}
