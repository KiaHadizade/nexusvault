import { getFileStatistics, getShareStatistics } from "../services/statistics.service.js"

export const getStatistics = async (req, res, next) => {
    try {
        const userId = req.user.id

        const [fileStats, shareStats] = await Promise.all([
            getFileStatistics(userId),
            getShareStatistics(userId)
        ])

        res.json({
            files: {
                total: fileStats.totalFiles,
                totalSize: fileStats.totalSize
            },

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