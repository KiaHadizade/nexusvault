import fs from "node:fs"
import path from "node:path"
import File from "../models/file.model.js"

export const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            })
        }

        const file = await File.create({
            originalName: req.file.originalname,
            storedName: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            owner: req.user.id
        })

        res.status(201).json({
            message: "File uploaded successfully",
            file: {
                id: file._id,
                originalName: file.originalName,
                mimeType: file.mimeType,
                size: file.size,
                createdAt: file.createdAt
            }
        })

    } catch (error) {
        next(error)
    }
}

export const listFiles = async (req, res, next) => {
    try {
        const files = await File.find({
            owner: req.user.id
        }).sort({
            createdAt: -1
        })

        res.status(200).json({
            files: files.map((file) => ({
                id: file._id,
                originalName: file.originalName,
                mimeType: file.mimeType,
                size: file.size,
                createdAt: file.createdAt
            }))
        })

    } catch (error) {
        next(error)
    }
}

export const downloadFile = async (req, res, next) => {
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
                message: "You are not allowed to access this file"
            })
        }

        const filePath = path.resolve(
            "storage",
            file.storedName
        )

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "Physical file not found"
            })
        }

        res.download(
            filePath,
            file.originalName
        )

    } catch (error) {
        next(error)
    }
}

export const deleteFile = async (req, res, next) => {
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
                message: "You are not allowed to delete this file"
            })
        }

        const filePath = path.resolve(
            "storage",
            file.storedName
        )

        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath)
        }

        await File.deleteOne({
            _id: file._id
        })

        res.status(200).json({
            message: "File deleted successfully"
        })

    } catch (error) {
        next(error)
    }
}