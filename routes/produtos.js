const express = require('express');
const router = express.Router();
const Produto = require('../models/produtos');

router.get('/buscar', async (req, res) => {
    const produtos = await Produto.find();
    res.json(produtos);
});

router.get('/buscarnome/:nome', async (req, res) => {
    try {
      const nome = req.params.nomeProduto;
      const produto = await Produto.findOne({ nome });
  
      if (!produto) {
        return res.status(404).send('Produto não encontrado');
      }
  
      res.json({
        id: produto._id,
        nome: produto.nomeProduto,
        cores: produto.cores,
        preco: produto.preco,
        categoria: produto.categoria
      });
    } catch (err) {
      res.status(500).send('Erro ao buscar produto');
    }
  });

router.get('/buscarcatg/:categoria', async (req, res) => {
    const categoria = req.params.categoria;
  
    try {
      const produtos = await Produto.find({
        categoria: new RegExp(categoria, 'i')
      });
  
      if (produtos.length === 0) {
        return res.status(404).send('Nenhum produto encontrado para essa categoria');
      }
  
      res.json(produtos);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      res.status(500).send('Erro ao buscar produtos por categoria');
    }
});


router.post('/criar', async (req, res) => {
  try {
    const novoProduto = new Produto(req.body);
    await novoProduto.save();
    res.status(201).json({ message: 'Produto criado!' });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ erro: 'Erro ao criar produto.' });
  }
});

router.delete('/deletar/:id', async (req, res) => {
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
router.patch('/alterarvalor/:nome', async (req, res) => {
  const nomeProduto = req.params.nome;
  const { preco } = req.body;

  try {
    const produto = await Produto.findOneAndUpdate(
      { nomeProduto },                  
      { $set: { preco } },              
      { new: true }                    
    );
    
    if (!produto) {
      return res.status(404).send('Produto não encontrado');
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar o valor');
  }
});

router.patch('/atualizar/:id', async (req, res) => {
  const { id } = req.params;
  const { disponivel } = req.body;

  try {
    // Validar ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    // Validar campo disponivel
    if (typeof disponivel !== 'boolean') {
      return res.status(400).json({ erro: 'O campo disponivel deve ser um booleano' });
    }

    // Atualizar produto
    const produto = await Produto.findByIdAndUpdate(
      id,
      { disponivel },
      { new: true, runValidators: true }
    );

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.status(200).json({
      message: 'Produto atualizado com sucesso',
      produto
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

module.exports = router;

