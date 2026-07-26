const { Schema, model } = require('mongoose');

const ProgramSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Program = model('Program', ProgramSchema);
module.exports = Program;
