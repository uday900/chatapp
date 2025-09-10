package com.darlachat.common;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Base class for auditing entity changes.
 * Tracks createdBy, createdDate, updatedBy, updatedDate, deletedBy, deletedDate.
 */
@MappedSuperclass
@Data
public abstract class Auditable {

    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "deleted_by")
    private String deletedBy;

    @Column(name = "deleted_date")
    private LocalDateTime deletedDate;

    /** Automatically set on entity creation */
    @PrePersist
    protected void onCreate() {
        this.createdDate = LocalDateTime.now();
        this.createdBy = getCurrentUser();
    }

    /** Automatically set on entity update */
    @PreUpdate
    protected void onUpdate() {
        this.updatedDate = LocalDateTime.now();
        this.updatedBy = getCurrentUser();
    }

    /** Automatically set on entity deletion */
    @PreRemove
    protected void onDelete() {
        this.deletedDate = LocalDateTime.now();
        this.deletedBy = getCurrentUser();
    }

    /**
     * Mock method for current user retrieval.
     * Replace with SecurityContext, JWT, or session user lookup.
     */
    private String getCurrentUser() {
        return "system"; // or SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // --- Getters & Setters ---

}

