import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";

async function startServer() {
  try {
    await connectDB();

    await import("./server.js");
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
