
const express = require("express");
const router = express.Router();
const { login, getProfile, updateProfile, logout } = require("../controllers/authController");

// Login route
router.post("/login", login);

// Get user profile
router.get("/profile", getProfile);

// Update profile
router.put("/profile", updateProfile);

// Logout route
router.get("/logout", logout);

module.exports = router;