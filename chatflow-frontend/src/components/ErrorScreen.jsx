import React from "react";

export default function ErrorScreen({ 
  errorType = "offline", 
  onRetry = () => window.location.reload(),
  isLoading = false
}) {
  const isOffline = errorType === "offline";
  
  const config = {
    offline: {
      icon: "📡",
      title: "No Internet Connection",
      message: "You appear to be offline. Please check your internet connection and try again.",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      secondaryMsg: "Check your WiFi or mobile data connection"
    },
    unavailable: {
      icon: "🔧",
      title: "Service Unavailable",
      message: "The chat service is temporarily unavailable. Our team is working on it. Please try again shortly.",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      buttonColor: "bg-orange-600 hover:bg-orange-700",
      secondaryMsg: "We'll notify you when the service is back online"
    }
  };

  const current = config[errorType] || config.offline;

  return (
    <div className={`h-screen w-screen flex items-center justify-center ${current.bgColor}`}>
      <div className="w-full max-w-md px-6 py-8 text-center">
        {/* Icon */}
        <div className={`${current.iconBg} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6`}>
          <span className="text-5xl">{current.icon}</span>
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold ${current.iconColor} mb-3`}>
          {current.title}
        </h1>

        {/* Message */}
        <p className="text-gray-600 text-sm mb-8 leading-relaxed">
          {current.message}
        </p>

        {/* Retry Button with Icon */}
        <button
          onClick={onRetry}
          disabled={isLoading}
          className={`${current.buttonColor} text-white font-semibold py-3 px-6 rounded-full transition 
          flex items-center justify-center gap-2 w-full disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer`}
          aria-label="Retry connection"
        >
          {isLoading ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Retrying...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Try Again</span>
            </>
          )}
        </button>

        {/* Additional Info */}
        <p className="text-gray-500 text-xs mt-6">
          {current.secondaryMsg}
        </p>
      </div>
    </div>
  );
}
