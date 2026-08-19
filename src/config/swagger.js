import swaggerJSDoc from "swagger-jsdoc"

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        info: {
        title: "NexusVault",
        version: "1.0.0",
        description: "API documentation for the Cloud Storage service - NexusVault",
        },
        servers: [
            { url: "http://localhost:5000" },
        ],
    },
    apis: ["./src/docs/*.swagger.js"], // Path to route files for reading comments
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)

export default swaggerSpec