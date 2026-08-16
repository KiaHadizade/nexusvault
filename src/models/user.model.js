import mongoose from "mongoose"

// Define the shape of user document
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true // automatically adds createdAt & updatedAt
    }
)

// Provide the interface to use to work with MongoDB
const User = mongoose.model("User", userSchema)

export default User