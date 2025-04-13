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
  
app.get('/relatorio', (req, res) => {
  const periodo = req.query.periodo;
  let inicio, fim;

  if (periodo === 'dia') {
    const hoje = new Date();
    inicio = new Date(hoje.setHours(0, 0, 0, 0)); // Início do dia
    fim = new Date(hoje.setHours(23, 59, 59, 999)); // Fim do dia
  } else if (periodo === 'semana') {
    const hoje = new Date();
    const primeiroDiaSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay())); // Primeiro dia da semana
    const ultimoDiaSemana = new Date(primeiroDiaSemana);
    ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 6); // Último dia da semana
    inicio = primeiroDiaSemana;
    fim = ultimoDiaSemana;
  } else if (periodo === 'mes') {
    const hoje = new Date();
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1); // Primeiro dia do mês
    fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0); // Último dia do mês
  }

  // Buscar as vendas no período
  Venda.find({
    dataCadastro: {
      $gte: inicio.toISOString(),
      $lte: fim.toISOString()
    }
  }).then(vendas => {
    const totalVendas = vendas.reduce((acc, venda) => acc + (venda.valorProduto - venda.desconto), 0);
    res.json({
      vendas,
      totalVendas
    });
  }).catch(err => {
    res.status(500).json({ erro: 'Erro ao buscar vendas' });
  });
});


module.exports = router;