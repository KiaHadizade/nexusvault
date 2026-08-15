import "dotenv/config" // Load the environment
import app from "./app.js" // Importing the Express application
import connectDatabase from "./config/database.js"

const PORT = process.env.PORT || 5000 // Use the environment's PORT if it exists; otherwise use 5000

const startServer = async () => {
    await connectDatabase()

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
    })
}

startServer()