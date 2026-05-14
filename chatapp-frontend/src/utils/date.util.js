function formatLastSeen(dateValue) {
  if (!dateValue) return "recently";

  const date = new Date(dateValue);
  const now = new Date();

  const diffMs = now - date;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Just now
  if (diffSeconds < 60) {
    return "just now";
  }

  // Minutes
  if (diffMinutes < 60) {
    return `${diffMinutes} min${
      diffMinutes > 1 ? "s" : ""
    } ago`;
  }

  // Hours
  if (diffHours < 24) {
    return `${diffHours} hour${
      diffHours > 1 ? "s" : ""
    } ago`;
  }

  // Yesterday
  if (diffDays === 1) {
    return `yesterday at ${date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }
    )}`;
  }

  // Older dates
  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year:
      now.getFullYear() !==
      date.getFullYear()
        ? "numeric"
        : undefined
  }) + ` at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })}`;
}

export { formatLastSeen };