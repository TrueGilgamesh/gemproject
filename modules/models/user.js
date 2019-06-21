const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

const userSchema = new mongoose.Schema({
  login: { type: String, unique: true },
  password: String,
  name: String,
  role: String,
  master: Boolean,
  sessionId: String,
  deleted: Boolean,
  registrationDate: Date,
  authorizationDate: Date,
  deletionDate: Date,
  favorites: [
    {
      gemType: { type: mongoose.Schema.Types.ObjectId, ref: 'GemType' },
      priority: Number
    }
  ]
});

userSchema.virtual('hasGems', {
  ref: 'Gem',
  localField: '_id',
  foreignField: 'owner',
  count: true
});

userSchema.virtual('minedGems', {
  ref: 'Gem',
  localField: '_id',
  foreignField: 'miner',
  count: true
});

userSchema.virtual('assignedGems', {
  ref: 'Gem',
  localField: '_id',
  foreignField: 'owner'
});

userSchema.virtual('receivedGems', {
  ref: 'Gem',
  localField: '_id',
  foreignField: 'owner'
});

userSchema.virtual('minedGemsList', {
  ref: 'Gem',
  localField: '_id',
  foreignField: 'miner'
});

userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.method('checkPassword', async function(password) {
  return await bcrypt.compare(password, this.password);
});

userSchema.method('setNewSessionId', async function() {
  const User = this.model('User');
  let sessionId;
  let usersCount;

  do {
    sessionId = uuidv4();
    usersCount = await User.countDocuments({ sessionId });
  } while (usersCount > 0);

  this.sessionId = sessionId;

  return sessionId;
});

mongoose.model('User', userSchema);
