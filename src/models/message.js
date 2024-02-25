const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  message: { type: String, required: true },
});

module.exports = mongoose.model('Message', MessageSchema);
