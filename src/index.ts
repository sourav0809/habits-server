import 'module-alias/register';
import dotenv from "dotenv";

import logger from "./config/logger";
import { connectDatabase } from "./config/mongoose";
import { createApp } from "./app";

dotenv.config();

const startServer = async () => {
  try {
    await connectDatabase();

    const app = createApp();
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception:", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason: Error) => {
      logger.error("Unhandled Rejection:", reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
