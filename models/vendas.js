const mongoose = require("mongoose");

const VendaSchema = new mongoose.Schema({
    nomeProduto: String,
    valorProduto: Number,
    desconto: Number,
    categoria: String,
    dataCadastro: {
        type: String,
        default: () => {
          const data = new Date();
          const dia = String(data.getDate()).padStart(2, '0');
          const mes = String(data.getMonth() + 1).padStart(2, '0'); // mês começa do 0
          const ano = String(data.getFullYear()).slice(-2); // últimos 2 dígitos do ano
          return `${dia}.${mes}.${ano}`; // formato: DD/MM/YY
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
      collection: 'Vendas'
});
    

module.exports = mongoose.model('Vendas', VendaSchema);