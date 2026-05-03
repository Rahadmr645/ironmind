import React from 'react'
import { Routes, Route } from 'react-router-dom'
import DashBoard from '../pages/dashboard/dasboard/DashBoard.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import Login from '../pages/auth/Login.jsx'
import VerifyOtp from '../pages/auth/VerifyOtp.jsx'
import MyAllTask from '../pages/dashboard/myalltask/MyAllTask.jsx'
import TaskComplete from '../pages/dashboard/taskcomplete/TaskComplete.jsx'
import TaskUnComplete from '../pages/dashboard/taskuncomplete/TaskUnComplete.jsx'
import Profile from '../pages/settings/profile/Profile.jsx'
import FocusMode from '../pages/dashboard/focus/FocusMode.jsx'

const AppRoutes = () => {

  return (
    <div className="routes-container">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/verify-otp' element={<VerifyOtp />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashBoard />
          </ProtectedRoute>
        } />
        <Route path='/myAllTask' element={
          <ProtectedRoute>
            <MyAllTask />
          </ProtectedRoute>
        } />
        <Route path='/task-complete' element={
          <ProtectedRoute>
            <TaskComplete />
          </ProtectedRoute>
        } />
        <Route path='/tasks-failed' element={
          <ProtectedRoute>
            <TaskUnComplete />
          </ProtectedRoute>
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path='/focus' element={
          <ProtectedRoute>
            <FocusMode />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}


export default AppRoutes;