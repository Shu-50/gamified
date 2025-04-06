// controllers/markController.js
const Student = require("../models/Student");

// Get student marks
const getMarks = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const student = await Student.findOne({ 
      studentId: req.session.user.studentId 
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ marks: student.marks || [] });
  } catch (err) {
    console.error("Get marks error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add new mark
const addMark = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { test, score } = req.body;
    
    if (!test || score === undefined) {
      return res.status(400).json({ message: "Test and score are required" });
    }

    const student = await Student.findOne({ 
      studentId: req.session.user.studentId 
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.marks) {
      student.marks = [];
    }

    student.marks.push({ test, score });
    await student.save();

    res.status(201).json({ 
      message: "Mark added successfully",
      marks: student.marks 
    });
  } catch (err) {
    console.error("Add mark error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMarks, addMark };