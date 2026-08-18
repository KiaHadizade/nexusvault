import User from "../models/user.model.js"

// Handle GET health request and generate the response
export const getHealth = (req, res) => {
    res.json({
        status: "ok",
        message: "Cloud Storage API is running",
        requestTime: req.requestTime
    })
}

export const createTestUser = async (req, res, next) => {
    try {
        const user = await User.create({
            email: "test@example.com",
            password: "temporary-password"
        })

        res.status(201).json({
            id: user._id,
            email: user.email
        })

    } catch (error) {
        next(error)
    }
}