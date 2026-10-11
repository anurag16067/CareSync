import express from 'express';
import { refresh, logout, logoutAll } from '../controllers/authController.js';

const authRouter = express.Router();

// :role is user | doctor | admin; each role has its own refresh cookie (rt_user, rt_doctor, rt_admin)
authRouter.post('/:role/refresh', refresh);
authRouter.post('/:role/logout', logout);
authRouter.post('/:role/logout-all', logoutAll);

export default authRouter;
