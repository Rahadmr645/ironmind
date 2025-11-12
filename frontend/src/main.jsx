import React from 'react'
import { createRoot } from 'react-dom/client'
import eruda from 'eruda'
eruda.init();
import './index.css'
import App from './App.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { TaskContextProvier } from './context/TaskContext.jsx';
import { PunistContextProvider } from './context/PunishmentContext.jsx';
import { NotificationContextProvider } from './context/NotificationContext.jsx';
createRoot(document.getElementById('root')).render(

  <AuthContextProvider>
    <TaskContextProvier>
      <PunistContextProvider>
        <NotificationContextProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </NotificationContextProvider>
      </PunistContextProvider>
    </TaskContextProvier>
  </AuthContextProvider>

)
