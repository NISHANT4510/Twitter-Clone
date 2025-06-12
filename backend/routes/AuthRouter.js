import express from 'express';
import authController from '../controller/AuthController.js';
import { loginValidation, signupValidation } from '../Middleware/AuthValidation.js';

const router = express.Router();

// router.post('/login',(req,res)=>{
//     res.send('login success')
// })

router.post('/signup',signupValidation, authController.signup)
router.post('/login',loginValidation, authController.login)

export default router;