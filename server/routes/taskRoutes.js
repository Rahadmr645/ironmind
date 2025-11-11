import express from "express"
import { deleteTaskByUser, getAllTask, getUserTaskList, taskCreate,autoUpdateOverdueTask } from '../controller/taskController.js'

const router = express.Router();

// route: 01 
router.post('/create/:userId', taskCreate);

// route: 02
router.get('/getUserTaskList/:userId', getUserTaskList);

// route: 03
router.get('/getAllTask', getAllTask);


// rotue: 04
router.delete('/deleteTaskByUser/:userId', deleteTaskByUser);

// routes 06:
router.put("/auto-update-overdue", autoUpdateOverdueTask);
export default router;