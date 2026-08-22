import { Router } from "express"
import { createShare, downloadSharedFile, revokeShare } from "../controllers/share.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = Router()

router.post("/:id", authMiddleware, createShare)
router.get("/:token", downloadSharedFile)
router.delete("/revoke/:id", authMiddleware, revokeShare)

export default router