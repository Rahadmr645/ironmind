import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import axios from 'axios'
// import { showSystemNotification } from "../utils/NotificaitonUtils";

export const TaskContext = createContext();

export const TaskContextProvier = ({ children }) => {
    const { URL, user } = useContext(AuthContext);
    const [showAddTask, setShowAddTask] = useState(false);


    const [taskContainer, setTaskContainer] = useState([]);


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


    console.log(taskContainer);

    // // useEffect(() => {
    // //     const checkUpcomingTasks = () => {
    // //         const now = new Date();
    // //         setTaskContainer(prevTasks => {
    // //             return prevTasks.map(task => {
    // //                 const start = new Date(task.startTime);
    // //                 const diffMinutes = (start - now) / 60000;

    // //                 if (diffMinutes > 0 && diffMinutes <= 10 && !task.notified) {
    // //                     showSystemNotification(
    // //                         "⏰ Task Reminder",
    // //                         `Your task "${task.title}" starts in ${Math.floor(diffMinutes)} minutes. Get ready!`
    // //                     );
    // //                     return { ...task, notified: true }; // update only this task
    // //                 }
    // //                 return task;
    // //             });
    // //         });
    // //     };

    //     const interval = setInterval(checkUpcomingTasks, 60000); // check every minute
    //     return () => clearInterval(interval);
    // }, [taskContainer]);


    const contextValue = {
        URL,
        showAddTask,
        setShowAddTask,
        taskContainer,

    }

    return (
        <TaskContext.Provider value={contextValue}>
            {children}
        </TaskContext.Provider>
    )


}
