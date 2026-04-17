import React, { useContext, useEffect, useState } from 'react'
import './App.css'
import AppRoutes from './routes/AppRoutes.jsx'
import Sidebar from './components/sidebar/Sidebar.jsx'
import { TaskContext } from './context/TaskContext.jsx'
import CreateTask from './pages/dashboard/createtask/CreateTask.jsx'
// import { requestNotificationPermission } from './utils/notificationPermission.js'
import { generateToken } from './utils/Firebase.js'
import { checkNotificationPermission, requestNotificationPermission } from './components/notificaitonpermission/notificationPermission.js'
import NotificationPopup from './components/notificaitonpermission/NotificationPopup.jsx'
import { useLocation } from 'react-router-dom'

// import DashBoard from './pages/dashboard/dasboard/DashBoard.jsx'

const App = () => {
  const { showAddTask } = useContext(TaskContext);
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/verify-otp';
  const [showPopup, setShowPopup] = useState(false);

  const [notyPopup, setNotyPopup] = useState(false);




  const checkLocaitonService = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setShowPopup(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED || err.code === err.POSITION_UNAVAILABLE) {
          setShowPopup(true);
        }
      }
    )
  }
  useEffect(() => {
    generateToken();
    // checkLocaitonService();
    checkLocaitonService(setNotyPopup);
  }, []);



  const handleAllow = async () => {
    const res = await requestNotificationPermission();

    if (res === "granted") {
      console.log("Notifications Enabled!");
      setShowPopup(false);
    } else {
      console.log("User still blocked notifications");
    }
  };
  return (
    <div className='app-container'>
      {showAddTask &&
        <CreateTask />

      }
      {!isAuthRoute && <Sidebar />}
      <AppRoutes />
      <NotificationPopup
        show={showPopup}
        onClose={setShowPopup}
        onAllow={handleAllow}
      />

    </div>
  )
}

export default App