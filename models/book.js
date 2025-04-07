// models/book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  publishYear: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['To Read', 'Completed', 'In Progress', 'Did Not Finish'],
    default: 'To Read'
  },
  tags: {
    type: [String],
    default: []
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
});

bookSchema.methods.getFormattedDate = function() {
    return this.addedDate ? this.addedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';
  };

module.exports = mongoose.model('Book', bookSchema);