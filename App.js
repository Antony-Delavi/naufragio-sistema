const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const https = require('https');
const cookieParser = require('cookie-parser');

const produtoRoutes = require('./routes/produtos');
const vendasRoutes = require('./routes/vendas');
const usuariosRoutes = require('./routes/usuarios');
const keepAlive = require('./routes/keepAlive')

const app = express();
const SELF_URL = 'https://naufragio-sistema.onrender.com/render/keepAlive';

// 🔒 Middlewares de segurança
app.use(helmet());
app.use(cors({ origin: 'https://naufragio.onrender.com' }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// 🧩 Middlewares de parsing
app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🗂️ Arquivos estáticos
app.use(express.static(path.join(__dirname, 'Front')));

// 🌐 Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

// 📦 Rotas
app.use('/produtos', produtoRoutes);
app.use('/vendas', vendasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/render', keepAlive)

// 🏠 Rotas de páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Front', 'index.html'));
});

app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'Front', 'telaInicial.html'));
});

// ⚠️ Rota não encontrada
app.use((req, res, next) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// ❌ Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// 🔁 Keep Alive no Render
setInterval(() => {
  https.get(SELF_URL, (res) => {
    console.log(`[KeepAlive] Ping enviado. Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('[KeepAlive] Erro ao enviar ping:', err.message);
  });
}, 2 * 60 * 1000);

// 🚀 Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
