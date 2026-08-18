import { Router } from "express"
import { getHealth, createTestUser } from "../controllers/health.controller.js"
import authenticate from "../middleware/auth.middleware.js"

const router = Router() // Mini Express application dedicated to a group of routes

router.get("/", getHealth)
router.post("/test-user", createTestUser)

router.post("/test", (req, res) => {
    console.log(req.body)

    res.json({
        received: req.body
    })
})

// Authenticated (protected) endpoint
router.get("/protected", authenticate, (req, res) => {
    res.json({
        message: "You are authenticated",
        userId: req.user.id
    })
})

export default router