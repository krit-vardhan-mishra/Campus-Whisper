const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'code', 'system', 'image'],
    default: 'text'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, { timestamps: true });

messageSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id;
  obj.timestamp = obj.createdAt;
  return obj;
};

module.exports = mongoose.model('Message', messageSchema);
