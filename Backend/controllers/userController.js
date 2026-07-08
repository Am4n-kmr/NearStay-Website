import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, gender, phone, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email,
      password: hash,
      gender,
      phone,
      role,
    });
    const savedUser = await user.save();
    const token = jwt.sign({ userId: savedUser._id, role: savedUser.role }, SECRET_KEY, {
      expiresIn: "7d",
    });
    res.status(201).json({
      message: "user registered!",
      savedUser,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "user not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "password did not matched!" });

    const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, {
      expiresIn: "7d",
    });
    res.status(201).json({
      message: "user logged in!",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        gender: user.gender,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
