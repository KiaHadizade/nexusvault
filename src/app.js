import express from "express"
import healthRouter from "./routes/health.routes.js"
import requestLogger from "./middleware/logger.middleware.js"

const app = express() // Backend application

// Middleware
app.use(express.json()) // JSON middleware
app.use(requestLogger)

// Route
app.use("/api/health", healthRouter)

export default app // Export express application