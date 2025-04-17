const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/usuarios');
const router = express.Router();
const authLogin = require('../middleware/authLogin');
const xss = require('xss');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try{
    const exists = await User.findOne({ username });
    if(exists) return res.status(400).json({ msg: 'Usúario ja existe'});

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashed });

    await newUser.save();
    res.status(201).json({ msg: 'Usuário registrado com sucesso' });
  } catch (err) {
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Usuário não encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Senha incorreta' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res
      .cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hora
        secure: true, // Ajuste para true em produção com HTTPS
        sameSite: 'lax',
      })
      .json({ msg: 'Login bem-sucedido' });
  } catch (err) {
    console.error(err); // Log do erro para depuração
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

router.get('/protected', authLogin, (req, res) => {
  res.json({ msg: `Bem vindo, usuário com ID ${req.user.id}`})
});

module.exports = router;