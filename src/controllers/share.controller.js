import Share from "../models/share.model.js"
import File from "../models/file.model.js"
import { generateShareToken, hashShareToken } from "../services/share.service.js"

export const createShare = async (req, res, next) => {
    try {
        const { id } = req.params
        const file = await File.findById(id)

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            })
        }

        if (file.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to share this file"
            })
        }

        const token = generateShareToken()
        const tokenHash = hashShareToken(token)

        const share = await Share.create({
            file: file._id,
            tokenHash
        })

        res.status(201).json({
            message: "Share link created successfully",
            share: {
                id: share._id,
                token,
                expiresAt: share.expiresAt,
                maxDownloads: share.maxDownloads
            }
        })
    } catch (error) {
        next(error)
    }
}