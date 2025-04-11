const express = require('express');
const router = express.Router();
const Produto = require('../models/produtos');
const Venda = require('../models/vendas');

router.post('/criarvenda', async (req, res) => {
    const { nomeProduto, desconto } = req.body;

    try {
        const produto = await Produto.findOne({ nomeProduto, disponivel: true });

        if (!produto) {
            return res.status(404).json({ erro: 'Produto não encontrado ou já foi vendido.' });
        }

        const novaVenda = new Venda({
            nomeProduto: produto.nomeProduto,
            valorProduto: produto.preco,
            desconto: desconto, 
            categoria: produto.categoria
        });

        await novaVenda.save();

        produto.disponivel = false;
        await produto.save();

        res.status(201).json({ mensagem: 'Venda realizada com sucesso!', venda: novaVenda });
    } catch (error) {
        console.error('Erro ao criar venda:', error);
        res.status(500).json({ erro: 'Erro interno ao criar venda' });
    }
});

module.exports = router;