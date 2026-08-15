import express from "express"
import healthRouter from "./routes/health.routes.js"
import requestLogger from "./middleware/logger.middleware.js"
import errorHandler from "./middleware/error.middleware.js"

const app = express() // Backend application

// Middleware
app.use(express.json()) // JSON middleware
app.use(requestLogger)

// Route
app.use("/api/health", healthRouter)

app.use(errorHandler) // The error handler is placed after routes

export default app // Export express application