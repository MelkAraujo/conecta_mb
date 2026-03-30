const express = require('express');
const cors = require('cors');
const PessoaRoutes = require('./routes/PessoaRoutes');
const authRoutes = require('./routes/authRoutes');
const unidadeRoutes = require('./routes/unidadeRoutes');

const app = express();

app.use(cors());
app.use(express.json()); // Permite receber JSON no corpo das requisições

// Aqui registraremos as rotas futuramente
app.use('/api/pessoas', PessoaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/unidades/', unidadeRoutes);

module.exports = app;