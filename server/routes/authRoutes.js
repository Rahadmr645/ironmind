import express from 'express';
import {  userCreate, userLogin } from '../controller/userController.js';


const router = express.Router();


// 01: 
router.post('/create', userCreate);

// 02: 
router.post('/login', userLogin);

// // 03: image update
// router.put('/profile-pic', upload.single('image'),  updateProfilePic)


export default router;