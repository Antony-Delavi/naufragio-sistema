const express = require('express');
const router = express.Router();
const authLogin = require('../middleware/authLogin')
const fazerBackup = require('../backup/googleDriveBackup')

router.get('/backupProdutos', async (req, res) => {
    try{
      const result = await fazerBackup();
      res.status(result.status === 'succes' ? 200 : 500).json(result);
    } catch (err) {
      res.status(500).json({
        status: 'error',
        logs: [`❌ Erro ao iniciar backup: ${err.message}`],
        error: err.message
      })
    }
});

module.exports = router;