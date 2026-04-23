const mongoose = require('mongoose');

const businessPageSchema = new mongoose.Schema(
  {
    pageName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BusinessPage', businessPageSchema);
