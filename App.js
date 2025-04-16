const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const https = require('https');
const SELF_URL = 'https://naufragio-sistema.onrender.com/';
const cookieParses = require('cookie-parser');
const produtoRoutes = require('./routes/produtos');
const vendasRoutes = require('./routes/vendas');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParses());
app.use(express.static(path.join(__dirname, 'Frontend')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

app.use('/produtos', produtoRoutes);
app.use('/vendas', vendasRoutes);
app.use('/usuarios', usuariosRoutes);

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'telaInicial.html'));
});

app.use((req, res, next) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
