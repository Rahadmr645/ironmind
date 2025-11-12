import React, { useContext } from 'react';
import './DashBoard.css';
import axios from "axios";
import CreateTask from '../createtask/CreateTask.jsx';
import { AuthContext } from '../../../context/AuthContext.jsx';
import { TaskContext } from '../../../context/TaskContext.jsx';
import { AiTwotoneCheckCircle } from "react-icons/ai";
import { BiLoaderCircle } from "react-icons/bi";
import TaskTimer from '../../../components/tasktimer/TaskTimer.jsx';
import DailyProgress from '../../../components/dailyprogress/DailyProgress.jsx';
import DisciplineScore from '../../../components/disciplinescore/DisciplineScore.jsx';

const DashBoard = () => {
  const { user, URL } = useContext(AuthContext);
  const { showAddTask, setShowAddTask, taskContainer } = useContext(TaskContext);

  // Filter today's tasks
  const todayTasks = taskContainer.filter(item => {
    const taskDate = new Date(item.startTime);
    const today = new Date();
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <div className="dashboard">
      <h4 className='dashboard-title'>
        WELCOME BACK, {user ? user.username.toUpperCase() : null}
      </h4>

      <div className="dashboard-grid">
        {/* TASKS */}
        <div className="dashboard-box">
          <h3 className="box-title">TASKS</h3>
          <div className="task-scroll-area">
            {todayTasks.length === 0 ? (
              <p>No tasks scheduled for today </p>
            ) : (
              <ul className="task-list">
                {todayTasks.map((item, i) => (
                  <li key={i} className="task-item">
                    {item.status === 'complete' ? (
                      <AiTwotoneCheckCircle className='task-icon done' />
                    ) : (
                      <BiLoaderCircle className='task-icon pending' />
                    )}
                    <div>
                      <span>{item.title}</span>
                      <TaskTimer task={item} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className='add-btn' onClick={() => setShowAddTask(true)}>
            Add Task
          </button>
        </div>

        {/* FOCUS TIMER */}
        <div className="dashboard-box">
          <h3 className="box-title">FOCUS TIMER</h3>
          <div className="circle-timer">
            <p>25:00</p>
            <span>Session Goals: Focus AM</span>
          </div>
        </div>

        {/* DAILY PROGRESS */}
        <div className="dashboard-box">
          <DailyProgress />
        </div>

        {/* DISCIPLINE SCORE */}
        <div className="dashboard-box">
          <DisciplineScore />
        </div>
      </div>
    </div>
  );
};

export default DashBoard;