const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  alias: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  passkey: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  handle: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  frequency: {
    type: String,
    enum: ['Main Campus', 'Engineering Hall', 'Arts District', 'The Dorms'],
    default: 'Main Campus'
  },
  joinedRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }]
}, { timestamps: true });

// Hash passkey before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('passkey')) return next();
  this.passkey = await bcrypt.hash(this.passkey, 12);
  next();
});

// Compare passkey
userSchema.methods.comparePasskey = async function(candidatePasskey) {
  return bcrypt.compare(candidatePasskey, this.passkey);
};

// Strip passkey from JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passkey;
  obj.id = obj._id;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
