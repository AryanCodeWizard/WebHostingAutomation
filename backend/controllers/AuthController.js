const User = require("../models/User");
const Client = require("../models/Client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");
const OTP = require("../models/Otp");
const logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/response");
const { HTTP_STATUS, USER_ROLES, SUCCESS_MESSAGES, ERROR_MESSAGES } = require("../constants");

/**
 * Send OTP to email for signup verification
 * @route POST /api/auth/send-otp
 * @param {String} req.body.email - User email
 */
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return sendError(res, "Email is required", HTTP_STATUS.BAD_REQUEST);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, "User already registered", HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }

        // Generate unique OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        // Ensure OTP is unique
        let existingOtp = await OTP.findOne({ otp });
        while (existingOtp) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false
            });
            existingOtp = await OTP.findOne({ otp });
        }

        // Save OTP to database
        await OTP.create({ otp, email });

        logger.info(`OTP generated for email: ${email}`);
        logger.debug(`OTP: ${otp}`);

        return sendSuccess(res, { otp }, SUCCESS_MESSAGES.OTP_SENT);
    } catch (error) {
        logger.error("Failed to send OTP", error);
        return sendError(res, "Error while sending OTP", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
    }
}

exports.signup = async (req, res) => {
    try {

        const { name, email, password, confirmPassword, systemRole, otp } = req.body;
        if (!name || !email || !password || !confirmPassword || !systemRole || !otp) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Password and Confirm Password do not match. Please try again.....",
            })
        }

        //Finding if user is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(500).json({
                success: false,
                message: "User already Registered"
            })
        }

        const recentOtp = await OTP.findOne({ email: email }).sort({ createdAt: -1 });

        if (!recentOtp) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request for a new OTP"
            })
        }

        if (recentOtp.createdAt < Date.now() - 10 * 60 * 1000) {
            return res.status(400).json({
                success: false,
                message: "OTP expired. Please request for a new OTP"
            })
        }

        if (recentOtp.otp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request for a new OTP"
            })
        }

        if (recentOtp.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again"
            })
        }

        //Hashing the passwrod
        const hashedPassword = await bcrypt.hash(password, 10);
        const data = {
            name: name,
            email: email,
            password: hashedPassword,
            role: systemRole,
            isActive: true,
            emailVerified: true,
        }

        const newUser = await User.create(data);
        await OTP.deleteOne({ email: email, otp: otp });

        // 🆕 Auto-create Client profile for new users
        if (systemRole === 'client') {
            await Client.create({
                userId: newUser._id,
                walletBalance: 0,
            });
            console.log("Client profile created for user:", newUser._id);
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: data
        })

    }
    catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: "Error while signup",
                error: error.message

            });
    }
}

exports.login = async (req, res) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            })
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please signup"
            })
        }



        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password. Please try again"
            })
        }



        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        //now generate a cookie and send it to the client along with token 
        res.cookie("token", token, {
            httpOnly: true,
            // Prevents JavaScript from accessing the cookie (protects against XSS attacks)

            secure: process.env.NODE_ENV === "production",
            // Cookie will only be sent over HTTPS in production
            // In development (HTTP), it will still work

            sameSite: "strict",
            // Prevents the cookie from being sent with cross-site requests
            // Helps protect against CSRF (Cross-Site Request Forgery)

            maxAge: 24 * 60 * 60 * 1000
            // Cookie expiration time in milliseconds (1 day)
        });



        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                token: token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        })
    }
    catch (error) {
        res.status(500)
            .json({
                success: false,
                message: "Error while logging",
                error: error.message
            })
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword, confirmNewPassword } = req.body;

        if (!email || !oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New Password and Confirm New Password do not match"
            })
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Old Password is incorrect"
            })
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })

    }
    catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: "Error while changing the password",
                error: error.message
            })
    }
}

//reset password via token and sent to the email - to be implemented later
exports.resetPassword = async (req, res) => {
    
    try{

    }
    catch(error){
        return res.status(500)
        .json({
            success: false,
            message: "Error while reseting the password",
            error: error.message
        })
    }
}