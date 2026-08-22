import mongoose from "mongoose"
import File from "../models/file.model.js"
import Share from "../models/share.model.js"

// File statistics
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
        totalSize: 0
    }
}

// Share statistics
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
                                    }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },

                revokedShares: {
                    $sum: {
                        $cond: [
                            "$revoked",
                            1,
                            0
                        ]
                    }
                },

                expiredShares: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    {
                                        $ne: [
                                            "$expiresAt",
                                            null
                                        ]
                                    },
                                    {
                                        $lte: [
                                            "$expiresAt",
                                            now // or - new Date()
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
        totalDownloads: 0
    }
}