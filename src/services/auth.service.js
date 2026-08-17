import bcrypt from "bcrypt"

const SALT_ROUNDS = 12 // Controls the computational cost

export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS)
}

export const comparePassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash)
}