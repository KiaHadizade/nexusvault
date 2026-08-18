import mongoose from "mongoose"

const fileSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true,
            trim: true
        },

        storedName: {
            type: String,
            required: true,
            unique: true
        },

        mimeType: {
            type: String,
            required: true
        },

        // Stores file size in bytes
        size: {
            type: Number,
            required: true
        },

        // Connects a file to a user
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)

const File = mongoose.model("File", fileSchema)

export default File