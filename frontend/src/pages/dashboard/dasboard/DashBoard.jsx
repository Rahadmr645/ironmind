
import react,{useContext,useState} from 'react'
import './DashBoard.css'
import CreateTask from '../createtask/CreateTask.jsx';
import {AuthContext} from '../../../context/AuthContext.jsx'
import ActiveTask from '../activetask/ActiveTask.jsx'
const DashBoard = () => {
  
  const { user, showAddTask, setShowAddTask} = useContext(AuthContext);
  
  console.log(showAddTask)
  return(
    <div className="dashboard-container">
      <h4>WELLCOME BACK, {user ?  user.username: null}</h4>
      <div>
        <ActiveTask />
        <button onClick={() => setShowAddTask(true)}>Add Task</button>
        {showAddTask &&
          <CreateTask />
        }
      
        
      </div>
    </div>
    )
}

export default DashBoard;