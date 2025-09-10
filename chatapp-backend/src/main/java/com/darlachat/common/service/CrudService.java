package com.darlachat.common.service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

/**
 * Generic CRUD service interface providing basic create, read, update, and delete operations
 * for any entity type.
 *
 * By using default methods, implementers can choose to override only
 * the methods they actually need, instead of being forced to implement all.
 *
 * @param <T>  Entity type
 * @param <ID> Type of the entity's identifier
 */
@Service
public interface CrudService<T, ID> {

    /**
     * Creates and saves a new entity.
     *
     * @param entity the entity to be created
     * @return the saved entity
     */
    default T create(T entity) {
        throw new UnsupportedOperationException("Create operation is not implemented.");
    }

    /**
     * Retrieves an entity by its ID.
     *
     * @param id the ID of the entity
     * @return an Optional containing the found entity or empty if not found
     */
    default Optional<T> getById(ID id) {
        return Optional.empty();
    }

    /**
     * Retrieves all entities of this type.
     *
     * @return a list of all entities
     */
    default List<T> getAll() {
        return Collections.emptyList();
    }

    /**
     * Updates an existing entity by its ID.
     * Throws custom exception if the entity does not exist.
     *
     * @param id     the ID of the entity to update
     * @param entity the entity data to update
     * @return the updated entity
     */
    default T update(ID id, T entity) {
        throw new UnsupportedOperationException("Update operation is not implemented.");
    }

    /**
     * Deletes an entity by its ID.
     *
     * @param id the ID of the entity to delete
     */
    default void delete(ID id) {
        throw new UnsupportedOperationException("Delete operation is not implemented.");
    }
}
