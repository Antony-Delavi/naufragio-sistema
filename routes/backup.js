const express = require('express');
const router = express.Router();
const authLogin = require('../middleware/authLogin')
const fazerBackupProdutos = require('../backup/backupProdutos')
const fazerBackupVendas = require('../backup/backupVendas')

router.get('/backupProdutos', authLogin, async (req, res) => {
    try{
      const result = await fazerBackupProdutos.fazerBackup();
      res.status(result.status === 'succes' ? 200 : 500).json(result);
    } catch (err) {
      res.status(500).json({
        status: 'error',
        logs: [`❌ Erro ao iniciar backup: ${err.message}`],
        error: err.message
      })
    }
});

router.get('/backupVendas', authLogin, async (req, res) => {
  try {
    const result = await fazerBackupVendas.fazerBackupVendas();
    res.status(result.status === 'succes' ? 200 : 500).json(result);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      logs: [`❌ Erro ao iniciar backup: ${err.message}`],
      error: err.message
    })
  }
});

router.get('/backup/backupVendas', async (req, res) => {
  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.BACKUP_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  const resultado = await fazerBackupVendas();
  res.status(200).json(resultado);
});

module.exports = router;