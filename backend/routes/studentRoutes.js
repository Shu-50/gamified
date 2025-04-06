const express = require('express');
const router = express.Router();
const Student = require('../models/Student'); // You'll need to create this model

// Get student details by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student profile
router.put('/:id', async (req, res) => {
  try {
    const { name, standard, division, email } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, standard, division, email },
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add marks to a student
router.post('/:id/marks', async (req, res) => {
  try {
    const { test, score } = req.body;
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Add new mark
    if (!student.marks) {
      student.marks = [];
    }
    
    student.marks.push({ test, score });
    await student.save();
    
    res.json(student.marks);
  } catch (error) {
    console.error('Error adding marks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;