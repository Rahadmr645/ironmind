import react from 'react'
import { Routes, Route } from 'react-router-dom'
import DashBoard from '../pages/dashboard/dasboard/DashBoard.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import Login from '../pages/auth/Login.jsx'
const AppRoutes = () => {

  return (
    <div>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
           <DashBoard/>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}


export default AppRoutes;