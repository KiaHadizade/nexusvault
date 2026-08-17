// Registration controller
import User from "../models/user.model.js"
import { hashPassword, generateToken } from "../services/auth.service.js"

export const register = async (req, res, next) => {
    try {
        // Extract the request body
        const { email, password } = req.body

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            })
        }

        // Check for an existing user
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            // 409 = Because the request conflicts with an existing resource
            return res.status(409).json({
                message: "Email is already registered"
            })
        }

        // Hash the password
        const passwordHash = await hashPassword(password)

        // Stores the hash, not the password
        const user = await User.create({
            email,
            password: passwordHash
        })

        // Generate the token which contains the user's ID
        const token = generateToken(user._id.toString())

        res.status(201).json({
            message: "Registration successful",
            token
        })

    } catch (error) {
        next(error)
    }
}