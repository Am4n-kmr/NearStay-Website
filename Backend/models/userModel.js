// models/userModel.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    //name of user
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["owner", "tenant", "student", "admin"],
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "not_required"],
      default: function () {
        return this.role === "owner" ? "pending" : "not_required";
      },
    },

    aadhaarLast4:{
      type:String,
      default:"",
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
