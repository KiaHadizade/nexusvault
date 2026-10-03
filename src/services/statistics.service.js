import mongoose from "mongoose"
import File from "../models/file.model.js"
import Share from "../models/share.model.js"
import User from "../models/user.model.js"
import Activity from "../models/activity.model.js"

// Quota Statistics
export const getStorageQuota = async (userId) => {
    const user = await User.findById(userId).select("storageQuota") //NOTE - User.findById(userId) returns the whole user document

    if (!user) {
        throw new Error("User not found")
    }

    return user.storageQuota
}

// File Statistics
export const getFileStatistics = async (userId) => {
    const ownerId = new mongoose.Types.ObjectId(userId)

    const result = await File.aggregate([
        {
            $match: {
                owner: ownerId
            }
        },
        {
            $group: {
                _id: null,
                totalFiles: {
                    $sum: 1
                },
                totalSize: {
                    $sum: "$size"
                }
            }
        }
    ])

    return result[0] ?? {
        totalFiles: 0,
        totalSize: 0 // is in bytes
    }
}

// Share Statistics
export const getShareStatistics = async (userId) => {
    const ownerId = new mongoose.Types.ObjectId(userId)
    const now = new Date()

    const result = await Share.aggregate([
        {
            $lookup: {
                from: "files",
                localField: "file",
                foreignField: "_id",
                as: "file"
            }
        },
        {
            $unwind: "$file"
        },
        {
            $match: {
                "file.owner": ownerId
            }
        },
        {
            $group: {
                _id: null,

                totalShares: {
                    $sum: 1
                },

                // Priority 1: Revoked
                revokedShares: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$revoked",
                                    true
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },

                // Priority 2: Expired
                expiredShares: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    {
                                        $eq: [
                                            "$revoked",
                                            false
                                        ]
                                    },
                                    {
                                        $ne: [
                                            "$expiresAt",
                                            null
                                        ]
                                    },
                                    {
                                        $lte: [
                                            "$expiresAt",
                                            now
                                        ]
                                    }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },

                // Priority 3: Download limit reached
                limitReached: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    {
                                        $eq: [
                                            "$revoked",
                                            false
                                        ]
                                    },
                                    {
                                        $or: [
                                            {
                                                $eq: [
                                                    "$expiresAt",
                                                    null
                                                ]
                                            },
                                            {
                                                $gt: [
                                                    "$expiresAt",
                                                    now
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        $ne: [
                                            "$maxDownloads",
                                            null
                                        ]
                                    },
                                    {
                                        $gte: [
                                            "$downloadCount",
                                            "$maxDownloads"
                                        ]
                                    }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },

                // Priority 4: Active
                activeShares: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    {
                                        $eq: [
                                            "$revoked",
                                            false
                                        ]
                                    },
                                    {
                                        $or: [
                                            {
                                                $eq: [
                                                    "$expiresAt",
                                                    null
                                                ]
                                            },
                                            {
                                                $gt: [
                                                    "$expiresAt",
                                                    now
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        $or: [
                                            {
                                                $eq: [
                                                    "$maxDownloads",
                                                    null
                                                ]
                                            },
                                            {
                                                $lt: [
                                                    "$downloadCount",
                                                    "$maxDownloads"
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },

                totalDownloads: {
                    $sum: "$downloadCount"
                }
            }
        }
    ])

    return result[0] ?? {
        totalShares: 0,
        activeShares: 0,
        revokedShares: 0,
        expiredShares: 0,
        limitReached: 0,
        totalDownloads: 0
    }
}

// File-Type Statistics
export const getFileTypeStatistics = async (userId) => {
    const ownerId = new mongoose.Types.ObjectId(userId)

    const result = await File.aggregate([
        {
            $match: {
                owner: ownerId
            }
        },

        {
            $project: {
                category: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $regexMatch: {
                                        input: "$mimeType",
                                        regex: "^image/"
                                    }
                                },
                                then: "image"
                            }, // Image detection

                            {
                                case: {
                                    $regexMatch: {
                                        input: "$mimeType",
                                        regex: "^video/"
                                    }
                                },
                                then: "video"
                            }, // Video detection

                            {
                                case: {
                                    $regexMatch: {
                                        input: "$mimeType",
                                        regex: "^audio/"
                                    }
                                },
                                then: "audio"
                            }, // Audio detection

                            {
                                case: {
                                    $in: [
                                        "$mimeType",
                                        [
                                            "application/pdf",
                                            "text/plain",
                                            "text/csv",
                                            "application/msword",
                                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                            "application/vnd.ms-excel",
                                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                            "application/vnd.ms-powerpoint",
                                            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                        ]
                                    ]
                                },
                                then: "document"
                            } // Documents detection
                        ],

                        default: "other"
                    }
                },

                size: 1
            }
        },

        {
            $group: {
                _id: "$category",

                count: {
                    $sum: 1
                },

                size: {
                    $sum: "$size"
                }
            }
        },

        {
            $project: {
                _id: 0,
                type: "$_id",
                count: 1,
                size: 1
            }
        },

        {
            $sort: {
                count: -1 //NOTE - -1 means descending
            }
        }
    ])

    return result
}

// Downloads Per File Statistics
export const getDownloadsPerFile = async (userId) => {
    const ownerId = new mongoose.Types.ObjectId(userId)

    const result = await Share.aggregate([
        {
            $lookup: {
                from: "files",
                localField: "file",
                foreignField: "_id",
                as: "file"
            } //NOTE - $lookup returns result as an array
        },

        {
            $unwind: "$file" //NOTE - $unwind turns the array to object
        },

        {
            $match: {
                "file.owner": ownerId
            } //NOTE - Restrict to user's own files
        },

        {
            $group: {
                _id: "$file._id", // Groupe the file by ID

                fileName: {
                    $first: "$file.originalName"
                },
                //NOTE - We have grouped the file by _id. So all the Shares inside a group belong to the same file
                // As a result, the originalName of all of them is the same and we can pick one of them (the first one)

                downloads: {
                    $sum: "$downloadCount"
                } //NOTE - A single file can have multiple shares
            }
        },

        {
            $project: {
                _id: 0,
                fileId: "$_id",
                fileName: 1,
                downloads: 1
            } //NOTE - Output shape
        },

        {
            $sort: {
                downloads: -1
            } //NOTE - Means that the most downloaded ones will be placed first
        }
    ])

    return result
}

export const getRecentActivity = async (userId, limit = 10) => {
    const ownerId = new mongoose.Types.ObjectId(userId)

    const result = await Activity.find({
        user: ownerId
    })
        .sort({
            createdAt: -1 //NOTE - createdAt comes automatically from `timestamps: true` We want newest first. MongoDB sorting -1 means descending
        }) // means: newest -> oldest
        .limit(limit)
        .populate("file", "originalName") //NOTE - Take the file ObjectId and give me the corresponding File's originalName
        .populate("share", "_id")

    return result
}

export const getActivityTimeline = async (userId, days = 7) => {
    const ownerId = new mongoose.Types.ObjectId(userId)
    
    // Date filtering
    const now = new Date()
    const startDate = new Date(
        now.getTime() -
        days * 24 * 60 * 60 * 1000
    )

    const result = await Activity.aggregate([
        {
            // Find the relevant activities
            $match: {
                user: ownerId,

                type: {
                    $in: [
                        "upload",
                        "download"
                    ]
                },

                createdAt: {
                    $gte: startDate,
                    $lte: now
                } // startDate ≤ createdAt ≤ now
            }
            //NOTE - Give activities belonging to this user, where the activity is either an upload or download,
            // and happened during the selected time period. So if days = 7, we only look at roughly the last seven days
        },

        {
            $group: {
                _id: {
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        } // Converts the timestamp: 2026-09-25T18:42:13.123Z into: 2026-09-25
                    },

                    type: "$type"
                },

                count: {
                    $sum: 1
                }
            } // Group activities by date & type
        },

        {
            $group: {
                _id: "$_id.date",

                uploads: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$_id.type",
                                    "upload"
                                ]
                            },
                            "$count",
                            0
                        ]
                    }
                },

                downloads: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$_id.type",
                                    "download"
                                ]
                            },
                            "$count",
                            0
                        ]
                    }
                }
            }
        },

        {
            $project: {
                _id: 0,
                date: "$_id",
                uploads: 1,
                downloads: 1
            }
        },

        {
            $sort: {
                date: 1 // Descending
            }
        }
    ])

    return result
}