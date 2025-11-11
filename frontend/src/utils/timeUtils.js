// utils/timeUtils.js
export const getTaskCountdown = (task) => {
    const now = new Date();
    const start = new Date(task.startTime);
    const end = new Date(task.endTime);

    if (now < start) {
        // Before start
        const diff = start - now;
        return { phase: 'waiting', timeLeft: diff };
    } else if (now >= start && now <= end) {
        // During active task
        const diff = end - now;
        return { phase: 'active', timeLeft: diff };
    } else {
        // Overdue
        const diff = now - end;
        return { phase: 'overdue', timeLeft: diff };
    }
};

// helper to format ms -> hh:mm:ss
export const formatTime = (ms) => {
    let totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};
