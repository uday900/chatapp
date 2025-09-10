package com.darlachat.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.darlachat.entity.AppUser;

public interface UserRepository extends JpaRepository<AppUser, Long>{

}
