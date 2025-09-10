package com.darlachat.repository;

import com.darlachat.entity.UserPresenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPresenceRepository extends JpaRepository<UserPresenceEntity, Long> {

    Optional<UserPresenceEntity> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}