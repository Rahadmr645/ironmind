import React, { useContext, useEffect, useState } from 'react'
import './App.css'
import AppRoutes from './routes/AppRoutes.jsx'
import Sidebar from './components/sidebar/Sidebar.jsx'
import { TaskContext } from './context/TaskContext.jsx'
import CreateTask from './pages/dashboard/createtask/CreateTask.jsx'
// import { requestNotificationPermission } from './utils/notificationPermission.js'
import { generateToken } from './utils/Firebase.js'
import TestFCM from './TestFCM.jsx'
import { checkNotificationPermission, requestNotificationPermission } from './components/notificaitonpermission/notificationPermission.js'
import NotificationPopup from './components/notificaitonpermission/NotificationPopup.jsx'

// import DashBoard from './pages/dashboard/dasboard/DashBoard.jsx'

const App = () => {
  const { showAddTask } = useContext(TaskContext);
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
      <Sidebar />
      <AppRoutes />
      <TestFCM />
      <NotificationPopup
        show={showPopup}
        onClose={setShowPopup}
        onAllow={handleAllow}
      />

    </div>
  )
}

export default App