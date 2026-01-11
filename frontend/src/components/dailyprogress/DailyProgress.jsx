import React, { useContext, useMemo } from 'react';
import './DailyProgress.css';
import { TaskContext } from '../../context/TaskContext';
import ProgressCircle from '../progresscircle/ProgressCircle';

const DailyProgress = () => {
    const { taskContainer } = useContext(TaskContext);
    const todayTasks = useMemo(() => {
        const today = new Date();
        return taskContainer.filter(task => {
            const taskDate = new Date(task.startTime);
            return (
                taskDate.getDate() === today.getDate() &&
                taskDate.getMonth() === today.getMonth() &&
                taskDate.getFullYear() === today.getFullYear()
            );
        });
    }, [taskContainer]);  
  
    const totalTasks = todayTasks.length;
    const completedTasks = todayTasks.filter(t => t.status === 'complete').length;
    const overdueTasks = todayTasks.filter(t => t.status === 'overdue').length;
    const percent = totalTasks > 0 ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 0;

    return (
        <div className="daily-progress">
            <h3>Daily Progress</h3>
            {totalTasks === 0 ? (
                <p>No tasks for today</p>
            ) : (
                <div className="progress-info">
                    <ProgressCircle
                        completed={completedTasks}
                        overdue={overdueTasks}
                        total={totalTasks}
                    />
                    <p>{completedTasks}/{totalTasks} tasks completed</p>
                    <span>Overdue: {overdueTasks}</span>
                </div>
            )}
        </div>
    );
};

export default DailyProgress;
