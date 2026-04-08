const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const sendEmail = require("../utils/sendEmail");
const db = require("../services/db");

exports.createUser = asyncHandler(async (req, res) => {
    const { name, email, password, address, phone } = req.body;
    const existing = await db.findUserByEmail(email);
    if (existing) return res.status(409).json({ message: "Email already exists" });
    await db.createUser({ name, email, password, address, phone });
    res.status(201).json({ message: "User Created Successful" });
});

exports.getMe = asyncHandler(async (req, res) => {
    const user = await db.findUserByIdNoPass(req.user._id);
    res.status(200).json(user);
});

exports.updateMe = asyncHandler(async (req, res) => {
    const { name, address, phone } = req.body;
    const update = { name, address, phone };
    if (req.file) update.image = req.file.filename;
    const user = await db.updateUserById(req.user._id, update);
    res.status(200).json({ message: "Profile updated successfully", user });
});

exports.updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await db.findUserById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
});

exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await db.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Incorrect Email Or Password" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect Email Or Password" });
    if (user.role !== "user") return res.status(403).json({ message: "Access denied" });
    if (user.status === "Inactive") return res.status(403).json({ message: "Account deactivated. Contact support." });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7h" });
    res.status(200).json({ message: "Login Successful", token, user: { name: user.name, image: user.image } });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
    const user = await db.findUserByEmail(req.body.email);
    if (!user) return res.status(200).json({ message: "If email exists, link sent" });
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    try {
        await sendEmail(
            user.email,
            "Password Reset",
            `<p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link expires in 10 minutes.</p>`
        );
        res.status(200).json({ message: "Email sent" });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500).json({ message: err.message });
    }
});

exports.resetPassword = asyncHandler(async (req, res) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await db.findUserByResetToken(hashedToken);
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({ message: "Password updated" });
});
