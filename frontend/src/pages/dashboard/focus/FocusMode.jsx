import React, { useContext, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { TaskContext } from '../../../context/TaskContext';
import './FocusMode.css';

const FocusMode = () => {
  const { taskContainer } = useContext(TaskContext);

  const todayTasks = useMemo(() => {
    const now = new Date();
    return (taskContainer || []).filter((item) => {
      const taskDate = new Date(item.startTime);
      return (
        taskDate.getDate() === now.getDate() &&
        taskDate.getMonth() === now.getMonth() &&
        taskDate.getFullYear() === now.getFullYear()
      );
    });
  }, [taskContainer]);

  const openTasks = todayTasks.filter((t) => {
    const s = String(t?.status || '').toLowerCase();
    return s !== 'completed' && s !== 'complete';
  });

  return (
    <div className="focus-mode-page">
      <header className="focus-mode-header">
        <h1>Focus mode</h1>
        <p className="focus-mode-lead">
          Pick one task below and work on it until done. Distractions stay off the main dashboard.
        </p>
        <NavLink to="/" className="focus-mode-back">
          ← Back to dashboard
        </NavLink>
      </header>

      <section className="focus-mode-list" aria-label="Today’s tasks">
        {openTasks.length === 0 ? (
          <p className="focus-mode-empty">No open tasks for today. Add one from the dashboard.</p>
        ) : (
          <ul>
            {openTasks.map((task) => (
              <li key={task._id || task.id}>
                <span className="focus-task-title">{task.title}</span>
                <span className="focus-task-meta">
                  {new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' — '}
                  {new Date(task.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="focus-task-status">{task.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default FocusMode;
