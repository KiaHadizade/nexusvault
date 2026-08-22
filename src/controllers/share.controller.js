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
            message: "Share created successfully",
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
        next(error)
    }
}