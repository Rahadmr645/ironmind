import React from 'react'
import { Routes, Route, Router } from 'react-router-dom'
import DashBoard from '../pages/dashboard/dasboard/DashBoard.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import Login from '../pages/auth/Login.jsx'
import MyAllTask from '../pages/dashboard/myalltask/MyAllTask.jsx'
import TaskComplete from '../pages/dashboard/taskcomplete/TaskComplete.jsx'
import TaskUnComplete from '../pages/dashboard/taskuncomplete/TaskUnComplete.jsx'
import Profile from '../pages/settings/profile/Profile.jsx'
const AppRoutes = () => {

  return (
    <div className="routes-container">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashBoard />
          </ProtectedRoute>
        } />
        <Route path='/myAllTask' element={<MyAllTask />} />
        <Route path='/task-complete' element={<TaskComplete />} />
        <Route path='/tasks-failed' element={<TaskUnComplete />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </div>
  )
}


export default AppRoutes;