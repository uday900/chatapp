package com.darlachat.service;

import com.darlachat.common.service.CrudService;
import com.darlachat.entity.AppUser;
import com.darlachat.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService implements CrudService<AppUser, Long> {

	private final UserRepository userRepository;
	
	@Override
	public AppUser create(AppUser entity) {
		return userRepository.save(entity);
	}

	@Override
	public Optional<AppUser> getById(Long aLong) {
		return userRepository.findById(aLong);
	}
}
