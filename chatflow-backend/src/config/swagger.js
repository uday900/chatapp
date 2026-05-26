const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Chat App API",
            version: "1.0.0",
            description: "API documentation for Chat Application"
        },
        servers: [
            {
                url: "http://localhost:3000/api/v1"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },

    apis: [
        "./src/routes/*.js",
        "./src/controllers/*.js"
    ]
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec
};