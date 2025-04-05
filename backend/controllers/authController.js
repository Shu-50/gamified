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

    req.session.user = {
      studentId: student.studentId,
      roomId: student.roomId,
    };

    console.log("Login successful:", req.session.user);
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login };

