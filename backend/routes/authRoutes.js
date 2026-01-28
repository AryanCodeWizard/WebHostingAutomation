import {signup,login,resetPassword,changePassword,sendOtp} from "../controllers/AuthController.js"


import express from "express";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/change-password", changePassword);
router.post("/send-otp", sendOtp);

export default router;