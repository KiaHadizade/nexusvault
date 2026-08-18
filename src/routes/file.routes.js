import { Router } from "express"
import authenticate from "../middleware/auth.middleware.js"
import upload from "../middleware/upload.middleware.js"
import { uploadFile, listFiles, downloadFile, deleteFile } from "../controllers/file.controller.js"

const router = Router()

router.get("/", authenticate, listFiles)
router.post("/upload", authenticate, upload.single("file"), uploadFile)
router.get("/:id/download", authenticate, downloadFile)
router.delete("/:id", authenticate, deleteFile)

export default router