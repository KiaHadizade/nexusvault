import express from "express"

const app = express() // Backend application

app.use(express.json()) // JSON middleware

// Route
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Cloud Storage API is running"
    })
})

export default app // Export express application