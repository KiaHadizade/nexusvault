import { Router } from "express"
import { getStatistics } from "../controllers/statistics.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = Router()

router.get("/stats", authMiddleware, getStatistics)

export default router