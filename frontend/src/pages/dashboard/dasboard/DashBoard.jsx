
import react, { useContext, useState } from 'react'
import './DashBoard.css'
import CreateTask from '../createtask/CreateTask.jsx';
import { AuthContext } from '../../../context/AuthContext.jsx'
import { TaskContext } from '../../../context/TaskContext.jsx';
import { AiTwotoneCheckCircle } from "react-icons/ai";
import { BiLoaderCircle } from "react-icons/bi";
import TaskTimer from '../../../components/tasktimer/TaskTimer.jsx';
const DashBoard = () => {
  const { user } = useContext(AuthContext);
  const { showAddTask, setShowAddTask, taskContainer } = useContext(TaskContext);

  return (
    <div className="dashboard">
      <h4 className='dashboard-title'>WELCOME BACK, {user ? user.username : null}</h4>
      <div className="dashboard-grid">
        {/* TASKS */}
        <div className="dashboard-box">
          <h3 className="box-title">TASKS</h3>
          <div className="task-scroll-area">
            {taskContainer.length === 0 ? (
              <p>Oops, there is no task!</p>
            ) : (
              <ul className="task-list">
                {taskContainer.map((item, i) => (
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
          <button className='add-btn' onClick={() => setShowAddTask(true)}>Add Task</button>

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
          <h3 className="box-title">DAILY PROGRESS</h3>
          <div className="progress-box">
            <p className="progress-percent">75%</p>
            <span>Tasks Completed</span>
          </div>
        </div>

        {/* DISCIPLINE SCORE */}
        <div className="dashboard-box">
          <h3 className="box-title">DISCIPLINE SCORE</h3>
          <div className="progress-box">
            <p className="progress-percent">9.2</p>
            <span>Current Streak: 7 Days</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashBoard;