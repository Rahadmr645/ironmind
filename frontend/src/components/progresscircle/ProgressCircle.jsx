import React, { useEffect, useState } from "react";
import "./ProgressCircle.css";

const ProgressCircle = ({ completed, overdue, total }) => {
  const [animated, setAnimated] = useState({ completed: 0, overdue: 0 });

  useEffect(() => {
    const duration = 800;
    const startTime = performance.now();
    const start = { completed: 0, overdue: 0 };
    const end = {
      completed: (completed / total) * 100 || 0,
      overdue: (overdue / total) * 100 || 0,
    };

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      setAnimated({
        completed: start.completed + (end.completed - start.completed) * progress,
        overdue: start.overdue + (end.overdue - start.overdue) * progress,
      });
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [completed, overdue, total]);

  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  const completedDash = (animated.completed / 100) * circumference;
  const overdueDash = (animated.overdue / 100) * circumference;
  const pendingDash = circumference - completedDash - overdueDash;

  return (
    <div className="progress-circle">
      <svg viewBox="0 0 36 36" className="circular-chart">
        <circle className="circle-bg" cx="18" cy="18" r={radius} />

        {/* Completed (green) */}
        <circle
          className="circle"
          cx="18"
          cy="18"
          r={radius}
          stroke="#00ff99"
          strokeDasharray={`${completedDash} ${circumference - completedDash}`}
          strokeDashoffset={0}
        />

        {/* Overdue (red) */}
        <circle
          className="circle"
          cx="18"
          cy="18"
          r={radius}
          stroke="#ff4d4d"
          strokeDasharray={`${overdueDash} ${circumference - overdueDash}`}
          strokeDashoffset={-completedDash}
        />

        {/* Pending (yellow) */}
        <circle
          className="circle"
          cx="18"
          cy="18"
          r={radius}
          stroke="#ffcc00"
          strokeDasharray={`${pendingDash} ${circumference - pendingDash}`}
          strokeDashoffset={-(completedDash + overdueDash)}
        />

        <text x="18" y="21" className="percentage">
          {Math.round(animated.completed)}%
        </text>
      </svg>
    </div>
  );
};

export default ProgressCircle;
