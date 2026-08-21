import { Router } from "express"
import { createShare } from "../controllers/share.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = Router()

router.post("/:id", authMiddleware, createShare)

export default router