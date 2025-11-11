
import Task from '../models/taskModel.js'
import User from '../models/userModel.js'



// 01: taks create 
export const taskCreate = async (req, res) => {

  try {
    console.log('taskdata', req.body)
    const { userId } = req.params;
    const { title, startTime, endTime, durationMinutes, status, proof, punishment, punishmentDuration, reviewedByAI } = req.body


    if (!userId) return res.status(400).json({ message: "please enter userId" });

    const isExist = await User.findById(userId);

    if (!isExist) return res.status(404).json({ message: 'user not exist' })


    const newTask = new Task({
      userId,
      title,
      startTime,
      endTime,
      durationMinutes,
      status,
      proof,
      punishment,
      punishmentDuration,
      reviewedByAI

    });

    await newTask.save();

    res.status(200).json({ message: "Task create successfully ", task: newTask })

  } catch (error) {
    res.status(500).json({ message: "Faild to create task", error: error.message })
  }
}


// 02: get all task my user Id 

export const getUserTaskList = async (req, res) => {

  try {
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ message: "user not valid" })

    const taskList = await Task.find({userId});

    res.status(200).json({ message: "task fetch successfully", TaskList: taskList })
  } catch (error) {
    res.status(400).json({ message: "faild to  fetch task", error: error.message })
  }
}

// 03: all task 

export const getAllTask = async (req, res) => {

  try {
    const allTaskList = await Task.find();

    res.status(200).json({ message: "fetch all task list successfully" });

  } catch (error) {
    res.status(500).json({ message: " faild to fetch all task list", error: error.message });
  }
}



// 04: Delete task by user

export const deleteTaskByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { id } = req.body;

    if (!userId) return res.status(404).json({ message: "user not found" });

    const isExist = await Task.findById(id);

    if (!isExist) return res.status(404).json({ message: "task not found" });

    const deleteTask = await Task.findByIdAndDelete(id);

    res.status(200).json({ message: `${isExist.title} Task deleted successfully` });

  } catch (error) {
    res.status(500).json({ message: 'fiald to delete task', error: error.message })
  }
}



// 05: Task update by user
export const updateTask = async (req, res) => {
  try {
    const { userId } = req.params;

  } catch (error) {

  }
}