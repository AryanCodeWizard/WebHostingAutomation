import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";
import OTP from "../models/Otp.js";

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            console.log("Email is missing while Sending OTP")
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(429).json({
                success: false,
                message: "User already registered"
            })
        }
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        let result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = {
            otp: otp,
            email: email
        }

        await OTP.create(otpPayload);


        console.log(`OTP for ${email} is ${otp}`);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp: otp
        })
    }
    catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: "Error while sending OTP",
                error: error.message
            });
    }
}

export const signup = async (req, res) => {
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

        await User.create(data);
        await OTP.deleteOne({ email: email, otp: otp });


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

export const login = async (req, res) => {

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

export const changePassword = async (req, res) => {
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
export const resetPassword = async (req, res) => {
    
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