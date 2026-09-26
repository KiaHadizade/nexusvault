import mongoose from "mongoose"

// Activity Collection = App Event History
const activitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "upload",
                "download",
                "share",
                "revoke",
                "delete"
            ],
            required: true
        },

        file: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            default: null
        },

        share: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Share",
            default: null
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model(
    "Activity",
    activitySchema
)