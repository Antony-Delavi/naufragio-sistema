const express = require('express');
const router = express.Router();
const Venda = require('../models/vendas');

router.get('/buscarvendas', async (req, res) => {
    const Vendas = await Vendas.find();
    res.json(Venda);
});

router.get('/buscarvendas/:dia', async (req, res) => {
    const dia = req.params.dia;
  
    try {
      const resultado = await Venda.find({ dataCadastro: dia });
  
      if (resultado.length === 0) {
        return res.status(404).send('Nenhuma venda encontrada para este dia');
      }
  
      res.json(resultado);
    } catch (err) {
      console.error('Erro ao buscar vendas:', err);
      res.status(500).send('Erro ao buscar vendas por data');
    }
});

router.get('/buscarvendasmes/:mes', async (req, res) => {
    const mes = req.params.mes; // Ex: "04.25"
  
    try {
      const vendas = await Venda.find({ mesCadastro: mes });
  
      if (vendas.length === 0) {
        return res.status(404).send('Nenhuma venda encontrada para este mês');
      }
  
      res.json(vendas);
    } catch (err) {
      console.error('Erro ao buscar vendas por mês:', err);
      res.status(500).send('Erro ao buscar vendas');
    }
  });
  

router.post('/vendaSimples', async (req, res) => {
    const novaVenda = new Venda(req.body);
    await novaVenda.save();
    res.status(201).send('Venda processada!');
});

module.exports = router;