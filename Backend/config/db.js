import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI is not defined");
    }

    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    console.log("MongoDB DNS servers:", dns.getServers());

    await mongoose.connect(uri);
    console.log("MongoDB connected");
}

export default connectDB;