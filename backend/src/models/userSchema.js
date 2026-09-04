const mongoose = require("mongoose");
const {Schema} = mongoose
const validator = require("email-validator")

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true , validate: [validator.validate, "Invalid email"]},
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["guest","engineer", "contractor", "manager", "senior-manager", "admin"],
    default: "guest"
  },
  // approval of account
  approved: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("User", userSchema);
