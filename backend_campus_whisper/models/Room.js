const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['tech', 'social', 'confessions', 'gaming', 'study', 'academic', 'clubs', 'memes', 'sports', 'music', 'mental-health', 'marketplace', 'events', 'careers'],
    default: 'social'
  },
  image: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  onlineCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

roomSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id;
  obj.lastActive = obj.updatedAt;
  return obj;
};

module.exports = mongoose.model('Room', roomSchema);
