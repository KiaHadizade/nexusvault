import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const SALT_ROUNDS = 12 // Controls the computational cost

// Password Hashing
export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS)
}

// Password Comparison
export const comparePassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash)
}

// Generate Token
export const generateToken = (userId) => {
    return jwt.sign(
        {
            userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1h"
        }
    )
}