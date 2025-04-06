
// controllers/authController.js
const Student = require("../models/Student");

const login = async (req, res) => {
  const { studentId, roomId, password } = req.body;
  console.log("Login attempt:", studentId, roomId, password);

  try {
    const student = await Student.findOne({
      studentId: studentId.trim(),
      roomId: roomId.trim(),
    });

    console.log("Student found in DB:", student);

    if (!student) {
      return res.status(401).json({ message: "Student not found" });
    }

    if (student.password !== password) {
      console.log("Password mismatch");
      return res.status(401).json({ message: "Invalid password" });
    }

    // Set session data
    req.session.user = {
      _id: student._id,
      studentId: student.studentId,
      roomId: student.roomId,
      name: student.name
    };

    console.log("Login successful:", req.session.user);
    
    // Return student data for frontend use
    res.status(200).json({
      message: "Login successful",
      studentId: student.studentId,
      roomId: student.roomId,
      name: student.name,
      standard: student.standard,
      division: student.division,
      email: student.email
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student profile
const getProfile = async (req, res) => {
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

    // Return student data (excluding password)
    res.status(200).json({
      studentId: student.studentId,
      roomId: student.roomId,
      name: student.name,
      standard: student.standard,
      division: student.division,
      email: student.email,
      marks: student.marks || []
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update student profile
const updateProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { name, standard, division, email } = req.body;
    
    const student = await Student.findOneAndUpdate(
      { studentId: req.session.user.studentId },
      { name, standard, division, email },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      studentId: student.studentId,
      roomId: student.roomId,
      name: student.name,
      standard: student.standard,
      division: student.division,
      email: student.email
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
};

module.exports = { login, getProfile, updateProfile, logout };