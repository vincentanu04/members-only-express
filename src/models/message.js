const moment = require('moment');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  message: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

MessageSchema.virtual('timestamp_formatted').get(function () {
  return moment(this.timestamp).format('LL');
});

module.exports = mongoose.model('Message', MessageSchema);
