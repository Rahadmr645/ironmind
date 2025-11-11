import React, { useEffect, useState } from "react";
import { formatTime, getTaskCountdown } from "../../utils/timeUtils";


const TaskTimer = ({ task }) => {
    const [time, setTime] = useState(getTaskCountdown(task));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(getTaskCountdown(task));
        }, 1000);
        return () => clearInterval(interval);
    }, [task]);


    let displayText = "";
    let color = "";

    if (time.phase === "waiting") {
        displayText = `Starts in ${formatTime(time.timeLeft)}`;
        color = "#00b7ff";
    } else if (time.phase === "active") {
        displayText = `Time left ${formatTime(time.timeLeft)}`;
        color = "#00ff88";
    } else {
        displayText = `Overdue by ${formatTime(time.timeLeft)}`;
        color = "#ff4d4d";
    }

    return <p style={{ color, fontSize: "13px" }}>{displayText}</p>;
};

export default TaskTimer;
