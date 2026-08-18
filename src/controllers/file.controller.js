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