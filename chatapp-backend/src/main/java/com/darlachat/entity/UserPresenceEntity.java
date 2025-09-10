package com.darlachat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_presence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPresenceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "is_online", nullable = false)
    private Boolean isOnline = false;

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    @PrePersist
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
