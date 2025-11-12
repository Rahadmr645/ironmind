import React, { useContext, useMemo, useState, useEffect } from 'react';
import './DisciplineScore.css';
import { TaskContext } from '../../context/TaskContext';

const DisciplineScore = () => {
  const { taskContainer } = useContext(TaskContext);
  const [timeframe, setTimeframe] = useState('7days');
  const [animatedScore, setAnimatedScore] = useState(0);

  // compute start date based on timeframe
  const startDate = useMemo(() => {
    const now = new Date();
    switch (timeframe) {
      case '7days':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      case '1month':
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case '1year':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      case 'lifetime':
        return new Date(0);
      default:
        return new Date(0);
    }
  }, [timeframe]);

  // filter tasks dynamically
  const filteredTasks = useMemo(() => {
    return taskContainer.filter(task => new Date(task.startTime) >= startDate);
  }, [taskContainer, startDate]);

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'complete').length;
  const disciplineScore = totalTasks > 0
    ? ((completedTasks / totalTasks) * 10).toFixed(1)
    : 0;

  // Animate the score
  useEffect(() => {
    let start = 0;
    const end = disciplineScore;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      setAnimatedScore((start + (end - start) * progress).toFixed(1));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [disciplineScore]);

  // Circle params
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 10) * circumference; // score out of 10

  return (
    <div className='discipline-score-box'>
      <h3 className="box-title">DISCIPLINE SCORE</h3>
      <select className='select' value={timeframe} onChange={e => setTimeframe(e.target.value)}>
        <option value="7days">Last 7 Days</option>
        <option value="1month">Last 1 Month</option>
        <option value="1year">Last 1 Year</option>
        <option value="lifetime">Lifetime</option>
      </select>

      <div className="score-circle-container">
        <svg className="score-circle" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ff99" />
              <stop offset="100%" stopColor="#00ffff" />
            </linearGradient>
          </defs>
          {/* Background Circle */}
          <circle className="circle-bg" cx="60" cy="60" r={radius} />
          {/* Progress Circle */}
          <circle
            className="circle-progress"
            cx="60"
            cy="60"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          {/* Score Text */}
          <text x="60" y="65" className="circle-text">
            {animatedScore}
          </text>
        </svg>
      </div>

      <div className="score-details">
        <span>{completedTasks}/{totalTasks} tasks completed</span>
      </div>
    </div>
  );
};

export default DisciplineScore;
