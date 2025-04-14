const express = require('express');
const router = express.Router();
const Produto = require('../models/produtos');
const Venda = require('../models/vendas');

router.get('/buscarvendas', async (req, res) => {
    const vendas = await Venda.find();
    res.json(vendas)
});

router.delete('/deletar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const venda = await Venda.findByIdAndDelete(id);
    if (!venda) {
      return res.status(404).json({ erro: 'Venda não encontrada' });
    }

    res.json({ message: 'Venda deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar venda:', error);
    res.status(500).json({ erro: 'Erro ao deletar venda' });
  }
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
  const mes = req.params.mes;

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
    const produto = await Produto.findOne({ nomeProduto, disponivel: true });

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado ou já foi vendido.' });
    }

    const novaVenda = new Venda({
      nomeProduto: produto.nomeProduto,
      valorProduto: produto.preco,
      desconto: Number(desconto),
      categoria: produto.categoria,
      dataCadastro: new Date().toISOString().split('T')[0],
      mesCadastro: new Date().toISOString().slice(5, 7) + '.' + new Date().toISOString().slice(2, 4),
      anoCadastro: new Date().toISOString().slice(0, 4)
    });

    await novaVenda.save();

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

router.get("/relatorio", async (req, res) => {
  const periodo = req.query.periodo;
  let dataFiltro;

  const hoje = new Date();
  const formatarData = (date) => {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = String(date.getFullYear()).slice(-2);
    return `${dia}.${mes}.${ano}`;
  };

  if (periodo === "dia") {
    dataFiltro = formatarData(hoje);
  } else if (periodo === "semana") {
    const primeiroDiaSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
    const ultimoDiaSemana = new Date(primeiroDiaSemana);
    ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 6);
    dataFiltro = {
      $gte: formatarData(primeiroDiaSemana),
      $lte: formatarData(ultimoDiaSemana)
    };
  } else if (periodo === "mes") {
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = String(hoje.getFullYear()).slice(-2);
    dataFiltro = { $regex: `^\\d{2}\\.${mes}\\.${ano}$` };
  } else if (periodo === "ano") {
    const ano = String(hoje.getFullYear()).slice(-2);
    dataFiltro = { $regex: `^\\d{2}\\.\\d{2}\\.${ano}$` };
  }

  try {
    const query = periodo === "dia" ? { dataCadastro: dataFiltro } : { dataCadastro: dataFiltro };
    const vendas = await Venda.find(query);
    const totalVendas = vendas.reduce(
      (acc, venda) => acc + (venda.valorProduto - venda.desconto),
      0
    );
    res.json({ vendas, totalVendas });
  } catch (err) {
    console.error("Erro ao buscar vendas:", err);
    res.status(500).json({ erro: "Erro ao buscar vendas" });
  }
});

module.exports = router;