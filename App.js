const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const https = require('https');
const SELF_URL = 'https://naufragio-sistema.onrender.com/';

const produtoRoutes = require('./routes/produtos');
const vendasRoutes = require('./routes/vendas')
const criarVenda = require('./routes/criarVenda')

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

app.use('/produtos', produtoRoutes);
app.use('/vendas', vendasRoutes)
app.use('/vendas', criarVenda)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

setInterval(() => {
  https.get(SELF_URL, (res) => {
    console.log(`[KeepAlive] Ping enviado. Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('[KeepAlive] Erro ao enviar ping:', err.message);
  });
}, 60 * 1000);