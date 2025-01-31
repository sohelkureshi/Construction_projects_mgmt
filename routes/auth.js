const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const router = express.Router();

// Signup Route
// Signup Route
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log("Signup request received with:", { name, email, password });

        const existingUser = await User.findOne({ email });
        console.log("Existing user:", existingUser);

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed password:", hashedPassword);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        console.log("User saved:", user);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        console.log("JWT token generated:", token);

        res.cookie("token", token, { httpOnly: true });
        return res.status(200).json({ message: "Signup successful", redirect: "/dashboard" });
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ message: "Server error" });
    }
});



// login route
router.post("/login", async (req, res) => {
    try {
        console.log("Login request received:", req.body);
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Invalid credentials");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });
        
        console.log("Login successful, sending response");
        return res.status(200).json({ message: "Login successful", redirect: "/dashboard" });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});




// Logout Route
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});

module.exports = router;
