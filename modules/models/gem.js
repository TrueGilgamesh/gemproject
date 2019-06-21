const mongoose = require('mongoose');

const gemSchema = new mongoose.Schema({
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'GemType' },
  miner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  mineDate: Date,
  assignDate: Date,
  confirmDate: Date,
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  manualAssignment: Boolean,
  deleted: Boolean
});

mongoose.model('Gem', gemSchema);
