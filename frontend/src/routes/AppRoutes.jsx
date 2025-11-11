import react from 'react'
import { Routes, Route } from 'react-router-dom'
import DashBoard from '../pages/dashboard/dasboard/DashBoard.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import Login from '../pages/auth/Login.jsx'
import MyAllTask from '../pages/dashboard/myalltask/MyAllTask.jsx'
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
      </Routes>
    </div>
  )
}


export default AppRoutes;