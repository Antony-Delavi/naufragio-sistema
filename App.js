const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const produtoRoutes = require('./routes/produtos');
const vendasRoutes = require('./routes/vendas')

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

app.use('/produtos', produtoRoutes);
app.use('/vendas', vendasRoutes)

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});