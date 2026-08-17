// Authentication Middleware
import jwt from "jsonwebtoken"

const authenticate = (req, res, next) => {
    try {
        // Read the Authorization header
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required"
            })
        }

        // Split the header
        const [scheme, token] = authHeader.split(" ")

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                message: "Invalid authorization header"
            })
        }

        // Verify the token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        req.user = {
            id: decoded.userId
        }

        next()
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}

export default authenticate