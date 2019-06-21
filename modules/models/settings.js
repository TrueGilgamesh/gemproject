const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  c1: { type: Number, default: 0 },
  c2: { type: Number, default: 0 },
  c3: { type: Number, default: 0 }
});

mongoose.model('Settings', settingsSchema, 'settings');
