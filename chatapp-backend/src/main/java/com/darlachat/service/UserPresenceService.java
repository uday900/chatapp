package com.darlachat.service;

import com.darlachat.repository.UserPresenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserPresenceService {

    private final UserPresenceRepository userPresenceRepository;

    public void setOnline(Long userId) {
        userPresenceRepository.findByUserId(userId)
                .ifPresent(presence -> {
                    presence.setIsOnline(true);
                    userPresenceRepository.save(presence);
                });
    }

    public void setOffline(Long userId) {
        userPresenceRepository.findByUserId(userId)
                .ifPresent(presence -> {
                    presence.setIsOnline(false);
                    userPresenceRepository.save(presence);
                });
    }
}
