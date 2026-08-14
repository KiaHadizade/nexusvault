import { Router } from "express"
import { getHealth } from "../controllers/health.controller.js"

const router = Router() // Mini Express application dedicated to a group of routes

router.get("/", getHealth)

export default router