package com.darlachat.mapper;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;

import java.util.Objects;
import java.util.Optional;

public class GlobalMapper {
	
	private static final ModelMapper modelMapper = new ModelMapper();

	static {
		modelMapper.getConfiguration().setAmbiguityIgnored(true);
		modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
	}
	
	/**
	 * Maps the source object to the destination class type.
	 * 
	 * @param <T>          The type of the destination class.
	 * @param source       The source object to be mapped.
	 * @param destionClass The class type to which the source object should be
	 *                     mapped.
	 * @return An Optional containing the mapped object if successful, or an empty
	 *         Optional if source or destination class is null.
	 */
	public static <T> Optional<T> mapDetails(Object source, Class<T> destionClass) {
		return Objects.isNull(source) || Objects.isNull(destionClass) 
				? Optional.empty() 
				: Optional.of(modelMapper.map(source, destionClass));
	}
}
