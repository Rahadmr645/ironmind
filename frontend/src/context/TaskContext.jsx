import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import axios from 'axios'

export const TaskContext = createContext();


export const TaskContextProvier = ({ children }) => {
    const { URL, user } = useContext(AuthContext);
    const [showAddTask, setShowAddTask] = useState(false);


    const [taskContainer, setTaskContainer] = useState([]);

   /* useEffect(() => {
    const interval = setInterval(async () => {
      try{
       const res =  await axios.put(`${URL}/api/task/auto-update-overdue`);
       console.log(res.data.message)
        console.log("chacked overdue")
      }catch(error) {
        console.log("faild to update overdue", error)
      }
    }, 3000);
    return () => clearInterval(interval)
  }, []);

  */
    // get the task 


    const fetchTaskList = async (userId) => {

        try {

            if (!userId) return console.log('userId not found')

            const res = await axios.get(`${URL}/api/task/getUserTaskList/${userId}`,)

            setTaskContainer(res.data.TaskList || []);
           

        } catch (error) {
            console.log("Error fetching tasks:", error)
        }
    }


    useEffect(() => {
        if (user?.id) {
            fetchTaskList(user.id)
        }
    }, [user])


console.log(taskContainer)
    const contextValue = {
        URL,
        showAddTask,
        setShowAddTask,
        taskContainer,
        setShowAddTask,

    }

    return (
        <TaskContext.Provider value={contextValue}>
            {children}
        </TaskContext.Provider>
    )


}
