import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { notFound } from "./middlewares/common.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import v1Routes from "./routes";

export const createApp = (): Application => {
  const app = express();

  // Pre-route middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (_, res) => {
    res.status(200).json({ status: "healthy !" });
  });

  // API routes
  app.use("/api/v1", v1Routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
