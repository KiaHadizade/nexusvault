import { getFileStatistics, getShareStatistics, getStorageQuota, getFileTypeStatistics } from "../services/statistics.service.js"

export const getStatistics = async (req, res, next) => {
    try {
        const userId = req.user.id

        const [fileStats, shareStats, storageQuota, fileTypeStats] = await Promise.all([
            getFileStatistics(userId),
            getShareStatistics(userId),
            getStorageQuota(userId),
            getFileTypeStatistics(userId)
        ]) //NOTE - All four operations happen concurrently

        // Calculate the storage values
        const storageUsed = fileStats.totalSize
        const storageRemaining = Math.max(storageQuota - storageUsed, 0) //NOTE - We don't want the API returning negative values if something went wrong
        const usagePercentage =
            storageQuota === 0
                ? 0
                : Math.min(
                    (storageUsed / storageQuota) * 100,
                    100
                ) //NOTE - To guarantee the displayed percentage never exceeds 100

        // Response
        res.json({
            storage: {
                quota: storageQuota,
                used: storageUsed,
                remaining: storageRemaining,
                usagePercentage
            },

            files: {
                total: fileStats.totalFiles,
                totalSize: fileStats.totalSize
            },

            fileTypes: fileTypeStats,

            shares: {
                total: shareStats.totalShares,
                active: shareStats.activeShares,
                revoked: shareStats.revokedShares,
                limitReached: shareStats.limitReached,
                expired: shareStats.expiredShares
            },

            downloads: {
                total: shareStats.totalDownloads
            }
        })
    } catch (error) {
        next(error)
    }
}