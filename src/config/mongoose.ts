import mongoose from "mongoose";

import envConfig from "./envConfig";
import logger from "./logger";

/**
 * Connect to MongoDB using Mongoose.
 * Uses connection string from env (MONGODB_URI or DATABASE_URL).
 */
const connectDatabase = async (): Promise<void> => {
  const uri = envConfig.databaseUrl;

  if (!uri) {
    throw new Error("DATABASE_URL (or MONGODB_URI) is required for database connection.");
  }

  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error;
  }
};

/**
 * Graceful disconnect from MongoDB.
 */
const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  } catch (error) {
    logger.error("MongoDB disconnect error:", error);
    throw error;
  }
};

export { connectDatabase, disconnectDatabase };
export default mongoose;
