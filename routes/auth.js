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

        // // console.log$&;

        const existingUser = await User.findOne({ email });
        // console.log$&;

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log$&;

        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        // console.log$&;

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        // console.log$&;

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
        // console.log$&;
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            // console.log$&;
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // console.log$&;
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });
        
        // console.log$&;
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
