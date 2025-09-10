package com.darlachat.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ExceptionLogServiceImpl implements ExceptionLogService {

	@Override
	public void saveException(Exception ex, String path) throws Exception {
		log.error("❌ Exception occurred: {}", ex.getMessage());
		ex.printStackTrace();
		
		// Save to DB (optional, can be toggled by config)
        // saveExceptionToDb(ex, path);
		
		throw ex;
	}
	
	/**
     * Save exception details into database (optional).
     */
    private void saveExceptionToDb(Exception ex, String path) {
        try {
            String exceptionType = ex.getClass().getName();
            ExceptionLog exceptionLog = new ExceptionLog();
//            ExceptionLog exceptionLog = new ExceptionLog(
//                exceptionType,
//                ex.getMessage(),
//                path,
//                "USER_ID_FROM_JWT_TOKEN", // Replace with actual user from SecurityContext
//                "ROLE_USER"
//            );

            // TODO: Call repository.save(exceptionLog);
            log.info("✅ Exception logged into DB: {}", exceptionLog);

        } catch (Exception dbEx) {
            // Fail-safe: never let DB failure break exception handling
            log.error("⚠️ Failed to save exception into DB: {}", dbEx.getMessage(), dbEx);
        }
    }

}
