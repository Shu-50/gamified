// const mongoose = require("mongoose");

// const studentSchema = new mongoose.Schema({
//   studentId: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   roomId: { type: String, required: true },
// });

// module.exports = mongoose.model("Student", studentSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  character: {
    type: String,
    default: 'default-character' // Path to default character image
  },
  lastPosition: {
    x: {
      type: Number,
      default: 100
    },
    y: {
      type: Number,
      default: 100
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
StudentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
StudentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);