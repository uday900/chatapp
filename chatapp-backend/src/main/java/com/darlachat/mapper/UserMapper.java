package com.darlachat.mapper;

import java.util.List;
import java.util.Optional;

import com.darlachat.dto.UserDto;
import com.darlachat.entity.AppUser;

public class UserMapper {
	
	public static AppUser toAppUser(UserDto userDto) {
		return GlobalMapper.mapDetails(userDto, AppUser.class).orElseThrow();
	}
	
	public static UserDto toUserDto(AppUser appUser) {
		return GlobalMapper.mapDetails(appUser, UserDto.class).orElseThrow();
	}
	
	public static List<UserDto> toUserDtoList(List<AppUser> appUsers) {
		return appUsers.stream()
				.map(user -> GlobalMapper.mapDetails(user, UserDto.class))
				.filter(Optional::isPresent)
				.map(Optional::get)
				.toList();
	}

}
