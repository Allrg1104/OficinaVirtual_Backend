const { Schema, model } = require('mongoose');

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    permissions: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Role = model('Role', RoleSchema);
module.exports = Role;
