import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import sequelize from "./config/database"; // Adjust path if your config is elsewhere
import { seedIfEmpty, ensureAdminExists } from "./database/seeders/seed";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1. Test Database Connection
    await sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");

    // 2. Start Express Server
    // Ensure DB has initial seed data if it's empty.
    try {
      await seedIfEmpty();
      await ensureAdminExists(); // Always guarantee at least one admin
    } catch (err) {
      console.error("❌ Error while attempting to seed database:", err);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`👉 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1); // Exit with failure code
  }
}

startServer();
