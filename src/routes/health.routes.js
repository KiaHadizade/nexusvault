import { Router } from "express"

const router = Router() // Mini Express application dedicated to a group of routes

router.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "Cloud Storage API is running"
    })
})

export default router