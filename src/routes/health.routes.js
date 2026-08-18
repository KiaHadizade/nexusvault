import { Router } from "express"
import { getHealth, createTestUser } from "../controllers/health.controller.js"

const router = Router() // Mini Express application dedicated to a group of routes

router.get("/", getHealth)
router.post("/test-user", createTestUser)

router.post("/test", (req, res) => {
    console.log(req.body)

    res.json({
        received: req.body
    })
})

export default router