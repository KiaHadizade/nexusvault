import app from "./app.js" // Importing the Express application
import "dotenv/config" // Load the environment

const PORT = process.env.PORT || 5000 // Use the environment's PORT if it exists; otherwise use 5000

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})