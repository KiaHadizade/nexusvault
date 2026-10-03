import { 
    getFileStatistics,
    getShareStatistics,
    getStorageQuota,
    getFileTypeStatistics,
    getDownloadsPerFile,
    getRecentActivity,
    getActivityTimeline
} from "../services/statistics.service.js"

export const getStatistics = async (req, res, next) => {
    try {
        const userId = req.user.id

        const [
            fileStats,
            shareStats,
            storageQuota,
            fileTypeStats,
            downloadsPerFile,
            recentActivity,
            activityTimeline
        ] = await Promise.all([
            getFileStatistics(userId),
            getShareStatistics(userId),
            getStorageQuota(userId),
            getFileTypeStatistics(userId),
            getDownloadsPerFile(userId),
            getRecentActivity(userId),
            getActivityTimeline(userId)
        ]) //NOTE - All operations happen concurrently

        // Calculate the storage values
        const storageUsed = fileStats.totalSize
        const storageRemaining = Math.max(storageQuota - storageUsed, 0) //NOTE - We don't want the API returning negative values if something went wrong
        const usagePercentage =
            storageQuota === 0
                ? 0
                : Math.min(
                    Number(
                        (
                            (storageUsed / storageQuota) *
                            100
                        ).toFixed(2)
                    ),
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
                total: shareStats.totalDownloads,
                byFile: downloadsPerFile
            },

            activity: recentActivity,
            timeline: activityTimeline
        })
    } catch (error) {
        next(error)
    }
}