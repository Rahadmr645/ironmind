import React, { useContext } from 'react'
import './App.css'
import AppRoutes from './routes/AppRoutes.jsx'
import Sidebar from './components/sidebar/Sidebar.jsx'
import { TaskContext } from './context/TaskContext.jsx'
import CreateTask from './pages/dashboard/createtask/CreateTask.jsx'
// import DashBoard from './pages/dashboard/dasboard/DashBoard.jsx'

const App = () => {
  const { showAddTask } = useContext(TaskContext);
  return (
    <div className='app-container'>
      {showAddTask &&
        <CreateTask />

      }
      <Sidebar />
      <AppRoutes />
    </div>
  )
}

export default App