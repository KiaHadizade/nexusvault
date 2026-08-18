import { Router } from "express"
import authenticate from "../middleware/auth.middleware.js"
import upload from "../middleware/upload.middleware.js"
import { uploadFile, listFiles } from "../controllers/file.controller.js"

const router = Router()

router.get("/", authenticate, listFiles)
router.post("/upload", authenticate, upload.single("file"), uploadFile)

export default router