import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

// Import server (which includes app and Socket.IO)
import "./server.js";
