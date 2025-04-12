const express = require('express');
const router = express.Router();
const Produto = require('../models/produtos');
const Venda = require('../models/vendas');

// Rota para criar uma venda
router.post('/criarvenda', async (req, res) => {
  const { nomeProduto, desconto } = req.body;  // Desestruturando os dados do corpo da requisição

  // Verificação do valor de desconto
  if (desconto < 0 || desconto > 100) {
    return res.status(400).json({ erro: 'Desconto inválido. Deve ser entre 0 e 100.' });
  }

  try {
    // Procurando o produto no banco de dados
    const produto = await Produto.findOne({ nomeProduto, disponivel: true });

    // Verificando se o produto existe e está disponível
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado ou já foi vendido.' });
    }

    // Cálculo do valor com desconto
    const valorComDesconto = produto.preco - (produto.preco * (desconto / 100));

    // Criando a venda
    const novaVenda = new Venda({
      nomeProduto: produto.nomeProduto,
      valorProduto: produto.preco,
      desconto: desconto,
      valorComDesconto: valorComDesconto,  // Adicionando o valor com desconto
      categoria: produto.categoria,
    });

    // Salvando a venda no banco
    await novaVenda.save();

    // Marcando o produto como não disponível
    produto.disponivel = false;
    await produto.save();

    // Retornando uma resposta de sucesso com os detalhes da venda
    res.status(201).json({ mensagem: 'Venda realizada com sucesso!', venda: novaVenda });

  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ erro: 'Erro interno ao criar venda' });
  }
});

module.exports = router;
