import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import ErrorScreen from "./ErrorScreen";
import { getMyChatsApi } from "../redux/slice/chat.slice";

export default function ConnectionWrapper({ children }) {
  const { isOnline, isBackendAvailable, errorType } = useConnectionStatus();
  const dispatch = useDispatch();
  const { chatsLoading } = useSelector((state) => state.chat);

  const handleRetry = useCallback(() => {
    console.log("Retrying...");
    
    // Try to refetch chats
    dispatch(getMyChatsApi());
    
    // Or reload the page if you prefer
    // setTimeout(() => window.location.reload(), 500);
  }, [dispatch]);

  if (!isOnline || !isBackendAvailable) {
    return (
      <ErrorScreen 
        errorType={errorType}
        onRetry={handleRetry}
        isLoading={chatsLoading}
      />
    );
  }

  return children;
}
