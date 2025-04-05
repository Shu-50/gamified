const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController"); // 👈 this might be broken

router.post("/login", login); // 💥 Error happens here if login is undefined

module.exports = router;
