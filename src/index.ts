import app from "./app";
import { config } from "./config/env";
import prisma from "./config/db";

const PORT = config.port || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);

  server.close(async () => {
    console.log("HTTP server closed");

    const shutdownTimer = setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);

    shutdownTimer.unref();

    await prisma.$disconnect();
    console.log("Prisma disconnected");
    clearTimeout(shutdownTimer);
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});
