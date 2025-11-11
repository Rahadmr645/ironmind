import express from "express"
import { deleteTaskByUser, getAllTask, getUserTaskList, taskCreate } from '../controller/taskController.js'

const router = express.Router();

// route: 01 
router.post('/create/:userId', taskCreate);

// route: 02
router.get('/getUserTaskList/:userId', getUserTaskList);

// route: 03
router.get('/getAllTask', getAllTask);


// rotue: 04
router.delete('/deleteTaskByUser/:userId', deleteTaskByUser);


export default router;