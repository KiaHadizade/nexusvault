import crypto from "node:crypto"
import fs from "node:fs"
import "dotenv/config"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12
const KEY_LENGTH = 32
const AUTH_TAG_LENGTH = 16

// Read the master key
const getEncryptionKey = () => {
    const key = process.env.FILE_ENCRYPTION_KEY

    if (!key) {
        throw new Error(
            "FILE_ENCRYPTION_KEY is not configured"
        )
    }

    const keyBuffer = Buffer.from(key, "hex") // Turns hexadecimal representation into: <Buffer 4c 5a ...> which Node's crypto API can use as the AES key

    if (keyBuffer.length !== KEY_LENGTH) {
        throw new Error(
            "FILE_ENCRYPTION_KEY must be exactly 32 bytes"
        )
    }

    return keyBuffer
}

// Encryption
export const encryptFile = async (inputPath, outputPath) => {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    const input = fs.createReadStream(inputPath)
    const output = fs.createWriteStream(outputPath)

    return new Promise((resolve, reject) => {
        output.write(iv)
        input.on("error", reject)
        cipher.on("error", reject)
        output.on("error", reject)
        output.on("finish", () => {
            try {
                const authTag = cipher.getAuthTag()

                fs.appendFile(outputPath, authTag, (error) => {
                    if (error) {
                        reject(error)
                        return
                    }
                    resolve()
                })

            } catch (error) {
                reject(error)
            }
        })

        input.pipe(cipher).pipe(output, { end: true })
    })
}

// Decryption
export const decryptFile = async (inputPath, outputPath) => {
    const key = getEncryptionKey()
    const stats = await fs.promises.stat(inputPath)
    const minimumSize = IV_LENGTH + AUTH_TAG_LENGTH

    if (stats.size < minimumSize) {
        throw new Error("Invalid encrypted file")
    }

    const fileHandle = await fs.promises.open(inputPath, "r")

    try {
        const iv = Buffer.alloc(IV_LENGTH)
        await fileHandle.read(iv, 0, IV_LENGTH, 0)
        const authTag = Buffer.alloc(AUTH_TAG_LENGTH)
        await fileHandle.read(authTag, 0, AUTH_TAG_LENGTH, stats.size - AUTH_TAG_LENGTH)
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

        decipher.setAuthTag(authTag)

        const input = fs.createReadStream(inputPath, {
            start: IV_LENGTH,
            end: stats.size - AUTH_TAG_LENGTH - 1
        })

        const output = fs.createWriteStream(outputPath)

        return new Promise((resolve, reject) => {
            input.on("error", reject)
            decipher.on("error", reject)
            output.on("error", reject)
            output.on("finish", resolve)
            input.pipe(decipher).pipe(output)
        })

    } finally {
        await fileHandle.close()
    }
}

// await encryptFile("storage/test.txt", "storage/test.txt.enc")
// await decryptFile("storage/test.txt.enc", "storage/test-decrypted.txt")