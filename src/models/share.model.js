import mongoose from "mongoose"

const shareSchema = new mongoose.Schema(
    {
        file: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            required: true
        },

        // Raw share token should not be stored in MongoDB
        tokenHash: {
            type: String,
            required: true,
            unique: true
        },

        expiresAt: {
            type: Date,
            default: null
        },

        maxDownloads: {
            type: Number,
            default: null
        },

        downloadCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model("Share", shareSchema)