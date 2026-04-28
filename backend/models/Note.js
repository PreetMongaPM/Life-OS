const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  color: { type: String, default: 'bg-[#1a1a2e] border-white/10' },
  imageUrl: { type: String, default: '' },
  tags: [{ type: String }],
  pinned: { type: Boolean, default: false },
  date: { type: String, default: 'Today' }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
