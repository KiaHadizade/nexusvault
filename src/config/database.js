import mongoose from "mongoose"

// It is asynchronous because connecting to a database takes time
const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI) // Starts the connection between application and MongoDB
        console.log("MongoDB connected successfully")
    } catch (error) {
        console.error("MongoDB connection failed:", error.message)
        process.exit(1) // Indicates that the process exited because of an error
    }
}

export default connectDatabase