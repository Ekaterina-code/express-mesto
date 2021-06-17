const mongoose = require('mongoose');

const objectIdType = mongoose.Schema.ObjectId;

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  owner: {
    type: objectIdType,
    required: true,
  },
  likes: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    Date: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
