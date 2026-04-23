const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // Email not required for phone-only guest registration
  },
  password: {
    type: String,
    // Not required, will be set as phone number for guest registration
  },
  googleId: {
    type: String,
  },
  picture: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  address: {
    houseNo: { type: String, default: "" },
    nearby: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
  },
  cart: {
    type: Array,
    default: [],
  },
  orderHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  isBlocked: {
    type: Boolean,
    default: false,
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  // Mobile change OTP fields
  mobileChangeOTP: {
    type: String,
  },
  mobileChangeOTPExpires: {
    type: Date,
  },
  pendingPhoneNumber: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (err) {
    throw err;
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
