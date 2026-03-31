const express = require('express');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');

const PessoaRoutes = require('./routes/PessoaRoutes');
const authRoutes = require('./routes/authRoutes');
const unidadeRoutes = require('./routes/unidadeRoutes');

const app = express();

app.use(cors());
app.use(express.json()); // Permite receber JSON no corpo das requisições

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Aqui registraremos as rotas futuramente
app.use('/api/pessoas', PessoaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/unidades/', unidadeRoutes);



module.exports = app;