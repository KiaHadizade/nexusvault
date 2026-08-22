import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import File from "../models/file.model.js"
import Share from "../models/share.model.js"
import { decryptFile } from "../services/encryption.service.js"
import { generateShareToken, hashShareToken } from "../services/share.service.js"

export const createShare = async (req, res, next) => {
    try {
        const { id } = req.params
        const { expiresIn, maxDownloads } = req.body ?? {}
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

        if (expiresIn !== undefined && (!Number.isInteger(expiresIn) || expiresIn <= 0)) {
            return res.status(400).json({
                message: "expiresIn must be a positive integer"
            })
        }

        if (maxDownloads !== undefined && (!Number.isInteger(maxDownloads) || maxDownloads <= 0)) {
            return res.status(400).json({
                message: "maxDownloads must be a positive integer"
            })
        }

        const token = generateShareToken()
        const tokenHash = hashShareToken(token)
        let expiresAt = null

        if (expiresIn !== undefined) {
            expiresAt = new Date(
                Date.now() + expiresIn * 1000
            )
        }

        const share = await Share.create({
            file: file._id,
            tokenHash,
            expiresAt,
            maxDownloads: maxDownloads ?? null
        })

        res.status(201).json({
            message: "Share created successfully",
            share: {
                id: share._id,
                token,
                expiresAt: share.expiresAt,
                maxDownloads: share.maxDownloads,
                downloadCount: share.downloadCount,
                revoked: share.revoked
            }
        })
    } catch (error) {
        next(error)
    }
}

export const downloadSharedFile = async (req, res, next) => {
    try {
        const { token } = req.params
        const tokenHash = hashShareToken(token)

        const share = await Share.findOne({
            tokenHash
        }).populate("file")

        if (!share) {
            return res.status(404).json({
                message: "Share link not found"
            })
        }

        const file = share.file

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            })
        }

        if (share.revoked) {
            return res.status(410).json({
                message: "Share link has been revoked"
            })
        }

        // Check expiration
        if (share.expiresAt && share.expiresAt <= new Date()) {
            return res.status(410).json({
                message: "Share link has expired"
            })
        }

        // Check download limit
        if (share.maxDownloads !== null && share.downloadCount >= share.maxDownloads) {
            return res.status(410).json({
                message: "Download limit reached"
            })
        }

        // Decrypt the file
        const encryptedPath = path.resolve(
            "storage",
            file.storedName
        )

        if (!fs.existsSync(encryptedPath)) {
            return res.status(404).json({
                message: "Physical file not found"
            })
        }

        const temporaryPath = path.resolve(
            "tmp",
            `share-${crypto.randomUUID()}`
        )

        await decryptFile(
            encryptedPath,
            temporaryPath
        )

        // Atomic increment
        const updatedShare = await Share.findOneAndUpdate(
            {
                _id: share._id,
                revoked: false,

                $or: [
                    {
                        maxDownloads: null
                    },
                    {
                        $expr: {
                            $lt: [
                                "$downloadCount",
                                "$maxDownloads"
                            ]
                        }
                    }
                ]
            },
            {
                $inc: {
                    downloadCount: 1
                }
            },
            {
                returnDocument: 'after'
                // new: true
            }
        )

        if (!updatedShare) {
            await fs.promises.unlink(temporaryPath)
            temporaryPath = undefined
            return res.status(410).json({
                message: "Download limit reached"
            })
        }

        // Send the file
        res.download(temporaryPath, file.originalName, async (error) => {
            try {
                await fs.promises.unlink(
                    temporaryPath
                )
            } catch {
                // Ignore cleanup errors.
            }

            if (error && !res.headersSent) {
                next(error)
            }
        })

    } catch (error) {
        if (temporaryPath) {
            try {
                await fs.promises.unlink(
                    temporaryPath
                )
            } catch {
                // Ignore cleanup errors.
            }
        }

        next(error)
    }
}

export const revokeShare = async (req, res, next) => {
    try {
        const { id } = req.params
        const share = await Share.findById(id).populate("file")

        if (!share) {
            return res.status(404).json({
                message: "Share not found"
            })
        }

        if (share.file.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to revoke this share"
            })
        }

        if (share.revoked) {
            return res.status(400).json({
                message: "Share is already revoked"
            })
        }

        share.revoked = true

        await share.save()

        res.json({
            message: "Share revoked successfully"
        })
    } catch (error) {
        next(error)
    }
}