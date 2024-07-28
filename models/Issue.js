const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  name: String,
  contact: String,
  description: String,
  location: String,
  category: String,
  severity: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', IssueSchema);
