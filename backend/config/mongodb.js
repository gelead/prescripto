import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true }); // load .env variables

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not found in .env");

    mongoose.connection.on("connected", () => console.log("Database Connected"));
    mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));
    await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`)

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // stop the app if DB connection fails
  }
};

export default connectDB;
