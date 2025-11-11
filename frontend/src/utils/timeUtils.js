export const getTaskCountdown = (task) => {
  const now = new Date();
  const start = new Date(task.startTime);
  const end = new Date(task.endTime);

  if (now < start) {
    const diff = start - now;
    return { phase: "waiting", timeLeft: diff };
  } else if (now >= start && now <= end) {
    const diff = end - now;
    return { phase: "active", timeLeft: diff };
  } else {
    const diff = now - end;
    return { phase: "overdue", timeLeft: diff };
  }
};


// Intelligent formatter
export const formatTime = (ms) => {
  if (ms <= 0) return "0s";

  let seconds = Math.floor(ms / 1000);
  const years = Math.floor(seconds / (365 * 24 * 3600));
  seconds %= 365 * 24 * 3600;
  const months = Math.floor(seconds / (30 * 24 * 3600));
  seconds %= 30 * 24 * 3600;
  const weeks = Math.floor(seconds / (7 * 24 * 3600));
  seconds %= 7 * 24 * 3600;
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  const parts = [];

  if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (weeks) parts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  if (seconds) parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

  // if short duration (<1 min), still show seconds
  if (parts.length === 0) return "0s";

  // keep it concise (show max 3 largest units)
  return parts.slice(0, 5).join(", ");
};