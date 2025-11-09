import React from 'react'
import './App.css'
import AppRoutes from './routes/AppRoutes.jsx'
import Sidebar from './components/sidebar/Sidebar.jsx'
const App = () => {
  return (
    <div className='app-container'>
      <Sidebar />
      <AppRoutes />
    </div>
  )
}

export default App