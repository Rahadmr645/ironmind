import React, { useContext, useEffect, useState } from 'react';
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
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [unlockOtp, setUnlockOtp] = useState('');
  const [lockMessage, setLockMessage] = useState('');
  const [lockStatus, setLockStatus] = useState({ isUnlocked: false, unlockedUntil: null });
  const [blockedAppsInput, setBlockedAppsInput] = useState('');
  const [lockPolicyEnabled, setLockPolicyEnabled] = useState(true);

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

  const isTaskFinished = (task) => {
    const status = String(task?.status || '').toLowerCase();
    return status === 'completed' || status === 'complete';
  };

  const completedTasks = taskContainer.filter(isTaskFinished);

  const fetchLockStatus = async () => {
    try {
      if (!user?.id) return;
      const res = await axios.get(`${URL}/api/lock/status/${user.id}`);
      setLockStatus(res.data || { isUnlocked: false, unlockedUntil: null });
    } catch (error) {
      console.error('Failed to get lock status:', error?.response?.data || error.message);
    }
  };

  const fetchLockPolicy = async () => {
    try {
      if (!user?.id) return;
      const res = await axios.get(`${URL}/api/lock/policy/${user.id}`);
      const apps = Array.isArray(res?.data?.blockedApps) ? res.data.blockedApps : [];
      setBlockedAppsInput(apps.join('\n'));
      setLockPolicyEnabled(res?.data?.isEnabled !== false);
    } catch (error) {
      console.error('Failed to get lock policy:', error?.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchLockStatus();
    fetchLockPolicy();
  }, [user?.id, URL]);

  const requestUnlockOtp = async () => {
    if (!selectedTaskId) {
      setLockMessage('Select a completed task first');
      return;
    }

    try {
      const res = await axios.post(`${URL}/api/lock/request-otp`, {
        userId: user?.id,
        taskId: selectedTaskId,
      });
      setLockMessage(res?.data?.message || 'OTP sent');
    } catch (error) {
      setLockMessage(error?.response?.data?.message || 'Failed to send unlock OTP');
    }
  };

  const verifyUnlockOtp = async () => {
    if (!selectedTaskId || !unlockOtp.trim()) {
      setLockMessage('Task and OTP are required');
      return;
    }

    try {
      const res = await axios.post(`${URL}/api/lock/verify-otp`, {
        userId: user?.id,
        taskId: selectedTaskId,
        otp: unlockOtp.trim(),
      });
      setLockMessage(res?.data?.message || 'Unlocked');
      setUnlockOtp('');
      fetchLockStatus();
    } catch (error) {
      setLockMessage(error?.response?.data?.message || 'Failed to verify OTP');
    }
  };

  const saveLockPolicy = async () => {
    try {
      const blockedApps = blockedAppsInput
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

      const res = await axios.put(`${URL}/api/lock/policy`, {
        userId: user?.id,
        isEnabled: lockPolicyEnabled,
        blockedApps,
      });

      setLockMessage(res?.data?.message || 'Lock policy saved');
      fetchLockPolicy();
    } catch (error) {
      setLockMessage(error?.response?.data?.message || 'Failed to save lock policy');
    }
  };

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const checkAndNotify = () => {
      const now = Date.now();

      todayTasks.forEach((task) => {
        const taskIdentity = task?._id || task?.id || `${task?.title}-${task?.startTime}`;
        const notifyKey = `task-notify-15m-${taskIdentity}`;

        if (isTaskFinished(task)) {
          localStorage.removeItem(notifyKey);
          return;
        }

        const start = new Date(task.startTime).getTime();
        const msToStart = start - now;
        const warningWindowMs = 15 * 60 * 1000;

        // Only notify once in the 15-minutes-before-start window.
        if (msToStart <= 0 || msToStart > warningWindowMs) return;
        if (localStorage.getItem(notifyKey) === 'sent') return;

        const mins = Math.ceil(msToStart / (1000 * 60));
        const body = `${task.title} starts in ${mins} minute${mins > 1 ? 's' : ''}.`;

        new Notification("IronMind Warning", {
          body,
          icon: "/ironmind-notification.svg",
          badge: "/ironmind-notification.svg",
          tag: `task-warning-${taskIdentity}`,
          renotify: false,
          requireInteraction: true,
        });

        localStorage.setItem(notifyKey, 'sent');
      });
    };

    checkAndNotify();
    const interval = setInterval(checkAndNotify, 30 * 1000);
    return () => clearInterval(interval);
  }, [todayTasks]);

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
                    {isTaskFinished(item) ? (
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

        <div className="dashboard-box lock-box">
          <h3 className="box-title">APP LOCK CONTROL</h3>
          <p className='lock-help-text'>
            Unlock OTP is sent only after selected task is completed.
          </p>

          <div className="lock-section">
            <h4 className="lock-section-title">Policy Setup</h4>
            <label className='lock-label'>Blocked App Package Names (one per line)</label>
            <textarea
              className="lock-apps-input"
              value={blockedAppsInput}
              onChange={(e) => setBlockedAppsInput(e.target.value)}
              placeholder={'com.facebook.katana\ncom.instagram.android\ncom.zhiliaoapp.musically'}
            />

            <label className="lock-toggle-label">
              <span>Enable app lock policy</span>
              <input
                type="checkbox"
                checked={lockPolicyEnabled}
                onChange={(e) => setLockPolicyEnabled(e.target.checked)}
              />
            </label>

            <div className="lock-btn-row">
              <button className="add-btn lock-btn" type="button" onClick={saveLockPolicy}>
                Save Lock Policy
              </button>
            </div>
          </div>

          <div className="lock-section">
            <h4 className="lock-section-title">Unlock Access</h4>
            <select
              className="lock-select"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              <option value="">Select completed task</option>
              {completedTasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>

            <div className="lock-btn-row">
              <button className="add-btn lock-btn" type="button" onClick={requestUnlockOtp}>
                Request OTP
              </button>
            </div>

            <input
              type="text"
              className="lock-otp-input"
              value={unlockOtp}
              onChange={(e) => setUnlockOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="Enter 6-digit OTP"
            />

            <div className="lock-btn-row">
              <button className="add-btn lock-btn" type="button" onClick={verifyUnlockOtp}>
                Verify & Unlock
              </button>
            </div>
          </div>

          <p className="lock-status-text">
            Status: {lockStatus?.isUnlocked ? 'Unlocked' : 'Locked'}
            {lockStatus?.isUnlocked && lockStatus?.unlockedUntil
              ? ` (until ${new Date(lockStatus.unlockedUntil).toLocaleTimeString()})`
              : ''}
          </p>
          {lockMessage ? <p className="lock-message-text">{lockMessage}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;