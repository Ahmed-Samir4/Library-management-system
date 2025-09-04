import User from '../../db/models/user.model.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../../utils/sendEmail.js';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export const signUp = async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const otpCode = nanoid(6);
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT);

    // Send verification email
    const isEmailSent = await sendEmail({
        to: email,
        subject: "Email Verification",
        message: `<h1>Hello ${name}</h1><p>Your code is : ${otpCode}</p>`
    });

    if (!isEmailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
    }


    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        otpCode: otpCode,
        otpExpires: otpExpires,
        otpAttempts: 0,
        otpBanExpires: null
    });
    await newUser.save();


    res.status(201).json({ message: "User registered successfully. Please verify your email with code sent to you" });

}

export const verifyEmail = async (req, res, next) => {

    const { email, otpCode } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.otpBanExpires && user.otpBanExpires > new Date()) {
        const wait = Math.ceil((user.otpBanExpires - new Date()) / 1000);
        return res.status(429).json({ mess: `Too many failed attempts. Try again in ${wait} seconds.` })
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
        return res.status(400).json({ mess: `OTP expired, request a new one` })
    }

    if (user.otpCode !== otpCode) {
        user.otpAttempts = (user.otpAttempts || 0) + 1;
        if (user.otpAttempts >= 5) {
            user.otpBanExpires = new Date(Date.now() + 1 * 60 * 1000);
            user.otpAttempts = 0;
        }
        await user.save();
        return res.status(400).json({ mess: `invalid otp code` })
    }
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    user.otpBanExpires = null;
    await user.save();
    return res.status(200).json({ mess: `Email verified successfully` })

}

export const requestVerCode = async (req, res, next) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ message: "Email required" });
    }


    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }


    if (user.otpBanExpires && user.otpBanExpires > new Date()) {
        const wait = Math.ceil((user.otpBanExpires - new Date()) / 1000);
        return res.status(429).json({ mess: `too many failed attempts. try again in ${wait} s` })
    }


    const otpCode = nanoid(6);
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    const isEmailSent = await sendEmail({
        to: user.email,
        subject: "new Verification",
        message: `<h1>Hello ${user.name}</h1><p>Your new code is : ${otpCode}</p>`
    });

    if (!isEmailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
    }

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0;
    user.otpBanExpires = null;
    await user.save();

    res.status(200).json({ message: "New verification code sent to your email" });


}

export const refreshToken = async (req, res, next) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
        return res.status(403).json({ message: "User already verified" });
    }

    const newAccessToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const isEmailSent = await sendEmail({
        to: user.email,
        subject: "New Access Token",
        message: `<h1>Hello ${user.name}</h1><p>Click the link below to get your new access token:</p><a href="http://localhost:${process.env.PORT}/auth/verify?token=${newAccessToken}">Get Access Token</a>`
    });

    if (!isEmailSent) {
        return res.status(500).json({ message: "Failed to send email" });
    }

    res.status(200).json({ message: "New access token sent to your email" });
}

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
        return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET, { expiresIn: '4h' });

    user.isLoggedIn = true;
    await user.save();

    res.status(200).json({ message: "Login successful", token });
}

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const forgetCode = nanoid(6);
    const isEmailSent = await sendEmail({
        to: user.email,
        subject: "Password Reset",
        message: `<h1>Hello ${user.name}</h1><p>Your password forget code is: ${forgetCode}</p>`
    });

    if (!isEmailSent) {
        return res.status(500).json({ message: "Failed to send email" });
    }

    user.forgetCode = forgetCode;
    await user.save();

    res.status(200).json({ message: "Forget code sent to email" });
}

export const resetPassword = async (req, res, next) => {
    const { email, forgetCode, password } = req.body;

    if (!email || !forgetCode || !password) {
        return res.status(400).json({ message: "Email, forget code, and new password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.forgetCode !== forgetCode) {
        return res.status(400).json({ message: "Invalid forget code" });
    }

    user.password = bcrypt.hashSync(password, +process.env.SALT);
    user.forgetCode = null; // Clear the forget code after reset
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
}

export const updateUser = async (req, res, next) => {
    const { id } = req.authUser;
    const { name, email } = req.body;

    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByPk(id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
}

export const deleteAccount = async (req, res, next) => {
    const { id } = req.authUser;

    const user = await User.findByPk(id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    await User.destroy({ where: { id: id } });

    res.status(200).json({ message: "Account deleted successfully" });
}

export const getAllUsers = async (req, res, next) => {

    const users = await User.findAll();
    if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users);

}