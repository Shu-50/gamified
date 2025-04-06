
const mongoose = require("mongoose");

const markSchema = new mongoose.Schema({
  test: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  roomId: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ""
  },
  standard: {
    type: String,
    default: ""
  },
  division: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: ""
  },
  marks: [markSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;