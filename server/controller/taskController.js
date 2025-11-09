
import Task from '../models/taskModel.js'
import User from '../models/userModel.js'
// 01: taks create 

export const taskCreate = async (req, res) => {
  
  try{
    const { userId} = req.params;
    const {title,startTime,endTime,durationMinutes,status,proof,punishment,punishmentDuration,reviewedByAI} = req.body
     
     
    if(!userId) return res.status(400).json({message:"please enter userId"});
    
    const isExist = await User.findById(userId);
    
    if(!isExist) return res.status(404).json({message:'user not exist'})
    
    
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
        
    }) ;
    
    await newTask.save();
    
    res.status(200).json({message:"Task create successfully ", task: newTask})
    
  } catch(error) {
    res.status(500).json({message:"Faild to create task" , error: error.message})
  }
}