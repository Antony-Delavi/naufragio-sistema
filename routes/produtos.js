const express = require('express');
const router = express.Router();
const Produto = require('../models/produtos');
const authLogin = require('../middleware/authLogin');
const xss = require('xss')

router.get('/buscar', authLogin, async (req, res) => {
    const produtos = await Produto.find();
    res.json(produtos);
});

router.post('/criar', authLogin, async (req, res) => {
  try {
    const novoProduto = new Produto(req.body);
    await novoProduto.save();
    res.status(201).json({ message: 'Produto criado!' });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ erro: 'Erro ao criar produto.' });
  }
});

router.delete('/deletar/:id', authLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Produto.findByIdAndDelete(id);

    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    res.status(200).json({ message: 'Produto deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar o produto:', error);
    res.status(500).json({ message: 'Erro interno ao deletar o produto.' });
  }
});

router.patch('/atualizar/:id', authLogin, async (req, res) => {
  const { id } = req.params;
  const {
    nomeProduto,
    preco,
    marca,
    estilo,
    tamanho,
    categoria,
    imagem,
    disponivel
  } = req.body;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const produto = await Produto.findById(id);
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    // Sanitize inputs
    const updatedFields = {};
    if (nomeProduto !== undefined) updatedFields.nomeProduto = xss(nomeProduto);
    if (preco !== undefined) {
      if (typeof preco !== 'number' || preco < 0) {
        return res.status(400).json({ erro: 'Preço deve ser um número positivo' });
      }
      updatedFields.preco = preco;
    }
    if (marca !== undefined) updatedFields.marca = xss(marca);
    if (estilo !== undefined) updatedFields.estilo = xss(estilo);
    if (tamanho !== undefined) updatedFields.tamanho = xss(tamanho);
    if (categoria !== undefined) updatedFields.categoria = xss(categoria);
    if (imagem !== undefined) updatedFields.imagem = xss(imagem);
    if (disponivel !== undefined) {
      if (typeof disponivel !== 'boolean') {
        return res.status(400).json({ erro: 'O campo disponivel deve ser um booleano' });
      }
      updatedFields.disponivel = disponivel;
    }

    // Update only provided fields
    Object.assign(produto, updatedFields);
    await produto.save();

    res.status(200).json({
      message: 'Produto atualizado com sucesso',
      produto
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ erro: 'Erro interno ao atualizar produto' });
  }
});

module.exports = router;

