import { Router } from 'express'
import { CreateNotification, getNotification, SeenNotification } from '../controller/notificationController';

const router = Router();


// 01: create notification 
router.post('/create', CreateNotification);

// 02: get notification 
router.get('/:userId', getNotification);


// 03: mark as seen 
router.put('/mark-as-seen', SeenNotification);
