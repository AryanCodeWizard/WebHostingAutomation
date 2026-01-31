const {signup,login,resetPassword,changePassword,sendOtp} = require("../controllers/AuthController");
const express = require("express");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/change-password", changePassword);
router.post("/send-otp", sendOtp);

module.exports = router;