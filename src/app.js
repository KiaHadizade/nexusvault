import express from "express"
import healthRouter from "./routes/health.routes.js"
import authRouter from "./routes/auth.routes.js"
import fileRouter from "./routes/file.routes.js"
import shareRouter from "./routes/share.routes.js"
import requestLogger from "./middleware/logger.middleware.js"
import errorHandler from "./middleware/error.middleware.js"
// Swagger docs
import swaggerUi from "swagger-ui-express"
import swaggerSpec from "./config/swagger.js"

const app = express() // Backend application

// Middleware
app.use(express.json()) // JSON middleware
app.use(requestLogger)

// Swagger Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Route
app.use("/api/health", healthRouter)
app.use("/api/auth", authRouter)
app.use("/api/files", fileRouter)
app.use("/api/share", shareRouter)

app.use(errorHandler) // The error handler is placed after routes

export default app // Export express application