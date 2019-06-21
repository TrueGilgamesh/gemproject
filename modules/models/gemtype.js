const mongoose = require('mongoose');

const gemTypeSchema = new mongoose.Schema({
  name: String,
  deleted: Boolean
});

mongoose.model('GemType', gemTypeSchema);
