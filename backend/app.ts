import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import routes from "./routes"; // This imports the index.ts from /routes
import passport from "passport";
import { jwtStrategy } from "./config/passport";
import requestLogger, { errorLogger } from "./middleware/logger.middleware";

const app: Application = express();

// --- 1. Global Middlewares ---
app.use(cors()); // Enable CORS for all origins (Configure strict origins for production)
app.use(express.json()); // Parse incoming JSON payloads

passport.use(jwtStrategy);
app.use(passport.initialize());

// Request logger: logs each request and response status/duration
app.use(requestLogger);

// --- 2. Mount API Routes ---
// We prefix everything with /api/v1 so we can version our API later
app.use("/api/v1", routes);

// --- 3. Health Check Route ---
// Good for verifying the server is up without hitting the DB
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// --- 4. Global Error Handling Middleware ---
// This catches any error thrown in your Services or Controllers
// Error logger: prints error stacks before sending responses
app.use(errorLogger);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ [Error]:", err.message);

  // If it's a known Sequelize validation error (e.g., duplicate email)
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.errors.map((e: any) => e.message),
    });
  }

  // Default Error Response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
