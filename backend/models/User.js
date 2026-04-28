const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },      // URL or base64
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  college: { type: String, default: '' },
  year: { type: String, default: '' },
  role: { type: String, default: 'Student' },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
