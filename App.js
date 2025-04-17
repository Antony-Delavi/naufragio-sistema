// 📦 Imports
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// 🔒 Segurança
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');

const https = require('https');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// 🌐 Rotas
const produtoRoutes = require('./routes/produtos');
const vendasRoutes = require('./routes/vendas');
const usuariosRoutes = require('./routes/usuarios');

// 🔧 Configuração
const app = express();
const SELF_URL = 'https://naufragio.onrender.com';
const PORT = process.env.PORT || 3000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true, 
  legacyHeaders: false, 
});

// 🔒 Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'https://naufragio.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(helmet());
app.use(limiter)
app.use(xss());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'Front')));

// 🛢️ Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// 📁 Rotas
app.use('/produtos', produtoRoutes);
app.use('/vendas', vendasRoutes);
app.use('/usuarios', usuariosRoutes);

// 🌐 Páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Front', 'index.html'));
});

app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'Front', 'telaInicial.html'));
});

// 🛡️ Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// 🕒 Keep Alive (Render)
setInterval(() => {
  https.get(SELF_URL, (res) => {
    console.log(`[KeepAlive] Ping enviado. Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('[KeepAlive] Erro ao enviar ping:', err.message);
  });
}, 5 * 60 * 1000);

// ❌ Rota 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// 🚀 Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
