const mongoose = require("mongoose");

const VendaSchema = new mongoose.Schema({
  nomeProduto: String,
  valorProduto: Number,
  desconto: Number,
  categoria: String,
  dataCadastro: {
    type: Date,
    default: Date.now
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
  collection: 'Vendas'
});

module.exports = mongoose.model('Venda', VendaSchema);
