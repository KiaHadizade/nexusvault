import { Router } from "express"
import { getHealth } from "../controllers/health.controller.js"
import authenticate from "../middleware/auth.middleware.js"

const router = Router() // Mini Express application dedicated to a group of routes

router.get("/", getHealth)

// Authenticated (protected) endpoint
router.get("/protected", authenticate, (req, res) => {
    res.json({
        message: "You are authenticated",
        userId: req.user.id
    })
})

export default router