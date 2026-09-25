import mongoose from "mongoose"
import File from "../models/file.model.js"
import Share from "../models/share.model.js"
import User from "../models/user.model.js"

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