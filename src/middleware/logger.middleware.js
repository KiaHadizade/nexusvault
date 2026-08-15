const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`)
    req.requestTime = new Date()

    next()
}

export default requestLogger