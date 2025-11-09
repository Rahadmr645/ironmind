import express from "express"
import {taskCreate} from '../controller/taskController.js'

const router = express.Router();

// route: 01 
router.post('/create/:userId', taskCreate);



export default router;