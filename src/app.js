import express from "express"
import healthRouter from "./routes/health.routes.js"

const app = express() // Backend application

app.use(express.json()) // JSON middleware

// Route
app.use("/api/health", healthRouter)

export default app // Export express application