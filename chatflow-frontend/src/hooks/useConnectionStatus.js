import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export function useConnectionStatus() {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    isBackendAvailable: true,
    errorType: null // 'offline' | 'unavailable' | null
  });

  const { chatsError, messagesError } = useSelector((state) => state.chat || {});

  useEffect(() => {
    // Handle browser online/offline events
    const handleOnline = () => {
      console.log("Back online");
      setStatus((prev) => ({
        ...prev,
        isOnline: true,
        errorType: prev.isBackendAvailable ? null : "unavailable"
      }));
    };

    const handleOffline = () => {
      console.log("Gone offline");
      setStatus({
        isOnline: false,
        isBackendAvailable: false,
        errorType: "offline"
      });
    };

    // Listen for server-down event (from axios interceptor)
    const handleServerDown = () => {
      console.log("Server down event received");
      if (navigator.onLine) {
        setStatus({
          isOnline: true,
          isBackendAvailable: false,
          errorType: "unavailable"
        });
      }
    };

    // Listen for server-up event to clear the unavailable state
    const handleServerUp = () => {
      console.log("Server up event received");
      setStatus((prev) => ({
        ...prev,
        isBackendAvailable: true,
        errorType: null
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("server-down", handleServerDown);
    window.addEventListener("server-up", handleServerUp);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("server-down", handleServerDown);
      window.removeEventListener("server-up", handleServerUp);
    };
  }, []);

  // Watch Redux errors - if we see network errors, mark backend as unavailable
  useEffect(() => {
    if (chatsError || messagesError) {
      const errorMsg = (chatsError || messagesError)?.toString?.() || "";
      const isNetworkError = 
        errorMsg.includes("ERR_NETWORK") ||
        errorMsg.includes("Failed to fetch") ||
        errorMsg.includes("Network Error") ||
        errorMsg.includes("ECONNREFUSED") ||
        errorMsg.includes("Cannot reach server") ||
        errorMsg.includes("ECONNABORTED");

      console.log("Network error detected:", errorMsg);

      if (isNetworkError && navigator.onLine) {
        setStatus({
          isOnline: true,
          isBackendAvailable: false,
          errorType: "unavailable"
        });
      }
    }
  }, [chatsError, messagesError]);

  return status;
}
