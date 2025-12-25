import express from "express";
import { registerUser, loginUser, logout, getAllUsers } from "../controllers/userController.js";
import { body } from 'express-validator'
import { autoSubscribeUserTopics } from "../controllers/pushnotification.js";

const router = express.Router();

// Delegate to userController (which itself is an Express router)
router.post('/signup' ,[
 body('fullname').isLength({ min: 3 }).withMessage('fullname must be at least 3 characters long'),
 body('email').isEmail().withMessage('Invalid email'),
 body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
] , registerUser , autoSubscribeUserTopics)

router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters and must add unique character')
], loginUser , autoSubscribeUserTopics)

router.post('/logout' , logout)
router.get('/users' , getAllUsers  ) // Admin user seen All users in dashboard
export default router;
