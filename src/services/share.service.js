// Share token logic
// This gives us a 32 random bytes -> 64 hexadecimal characters which is a very large random space
import crypto from "node:crypto"

export const generateShareToken = () => {
    return crypto.randomBytes(32).toString("hex")
}

export const hashShareToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex")
}