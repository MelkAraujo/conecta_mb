const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path'); // 1. Adicione esta linha no topo!

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Conecta MB - Edifício Montebelo',
            version: '1.0.0',
            description: 'Documentação oficial das APIs do sistema de gestão condominial.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de Desenvolvimento'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Insira o seu Token JWT aqui para testar as rotas protegidas.'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    // O Swagger vai procurar as anotações dentro de todos os arquivos na pasta routes
    apis: [path.join(__dirname, '../routes/*.js')], 
};

module.exports = swaggerJSDoc(swaggerOptions);