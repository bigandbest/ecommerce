import express from 'express';
import { signup, login, logout, getMe, getAllBusinessUsers, uploadAvatar, updateUserAvatar, removeUserAvatar } from '../controller/authController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/business-users', getAllBusinessUsers); 
router.get('/me', authenticate, getMe);
router.post('/upload-avatar', authenticate, uploadAvatar, updateUserAvatar);
router.delete('/remove-avatar', authenticate, removeUserAvatar);

export default router;
