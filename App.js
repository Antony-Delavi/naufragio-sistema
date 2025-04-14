const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const https = require('https');
const SELF_URL = 'https://naufragio-sistema.onrender.com/';

const produtoRoutes = require('./routes/produtos');
const vendasRoutes = require('./routes/vendas')

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

app.use('/produtos', produtoRoutes);
app.use('/vendas', vendasRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.use((req, res, next) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

setInterval(() => {
  https.get(SELF_URL, (res) => {
    console.log(`[KeepAlive] Ping enviado. Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('[KeepAlive] Erro ao enviar ping:', err.message);
  });
}, 5 * 60 * 1000);