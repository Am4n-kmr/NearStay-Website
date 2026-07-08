import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Fetch user from DB to get fresh role data
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(403).json({ message: "Invalid Token" });
  }
};

// Role-based access middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. ${roles.join(" or ")} only.` });
    }
    next();
  };
};

export default authenticate;