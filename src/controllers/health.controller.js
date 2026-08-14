// Handle GET health request and generate the response
export const getHealth = (req, res) => {
    res.json({
        status: "ok",
        message: "Cloud Storage API is running"
    })
}