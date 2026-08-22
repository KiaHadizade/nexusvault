import { Router } from "express"
import { createShare, downloadSharedFile } from "../controllers/share.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = Router()

router.post("/:id", authMiddleware, createShare)
router.get("/:token", downloadSharedFile)
export default router