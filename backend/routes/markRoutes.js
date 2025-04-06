// routes/markRoutes.js
const express = require("express");
const router = express.Router();
const { getMarks, addMark } = require("../controllers/markController");

// Get student marks
router.get("/", getMarks);

// Add new mark
router.post("/", addMark);

module.exports = router;