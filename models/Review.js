const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  score: {
    type: Number,
    required: [true, 'Please add a review score'],
    min: [0, 'Please rate in range 1 - 10'],
    max: [10,'Please rate in range 1 - 10'],
  },
  title: {
    type: String
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Review', ReviewSchema);