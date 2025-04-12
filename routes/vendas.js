const express = require('express');
const router = express.Router();
const Produto = require('../models/produtos');
const Venda = require('../models/vendas');

router.get('/buscarvendas', async (req, res) => {
    const vendas = await Venda.find();
    res.json(vendas)
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
  
router.post('/criar', async (req, res) => {
    const { nomeProduto, desconto } = req.body;
  
    try {
      // Busca o produto disponível pelo nome
      const produto = await Produto.findOne({ nomeProduto, disponivel: true });
  
      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado ou já foi vendido.' });
      }
  
      // Cria a venda com os dados do produto
      const novaVenda = new Venda({
        nomeProduto: produto.nomeProduto,
        valorProduto: produto.preco,
        desconto: Number(desconto),
        categoria: produto.categoria,
        dataCadastro: new Date().toISOString().split('T')[0],
        mesCadastro: new Date().toISOString().slice(5, 7) + '.' + new Date().toISOString().slice(2, 4)
      });
  
      await novaVenda.save();
  
      // Marca o produto como indisponível
      produto.disponivel = false;
      await produto.save();
  
      res.status(201).json({
        mensagem: 'Venda registrada com sucesso!',
        venda: novaVenda
      });
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      res.status(500).json({ erro: 'Erro interno ao registrar a venda.' });
    }
});

module.exports = router;