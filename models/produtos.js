const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
  nomeProduto: String,
  preco: Number,
  marca: String,
  estilo: String,
  tamanho: String,
  categoria: String,
  imagem: String,
  disponivel: {
    type: Boolean,
    default: true
  },
  dataCadastro: {
    type: String,
    default: () => {
      const data = new Date();
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = String(data.getFullYear()).slice(-2);
      return `${dia}.${mes}.${ano}`;
    }
  },
  mesCadastro: {
    type: String,
    default: () => {
      const data = new Date();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = String(data.getFullYear()).slice(-2);
      return `${mes}.${ano}`;
    }
  }
}, {
  collection: 'Produtos'
});

module.exports = mongoose.model('Produto', ProdutoSchema);