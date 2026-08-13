import app from "./app.js" // Importing the Express application

const PORT = 5000

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})