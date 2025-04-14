const axios = require('axios');

const API_URL = 'https://naufragio-sistema.onrender.com/produtos/buscar'; // Altere para a rota desejada
const TOTAL_REQUISICOES = 10000; // Número de vezes que a rota será chamada

const testarRequisicoesGET = async () => {
  const promessas = [];

  for (let i = 0; i < TOTAL_REQUISICOES; i++) {
    promessas.push(
      axios.get(API_URL)
        .then(res => {
          console.log(`Requisição ${i + 1} OK - Status: ${res.status}`);
        })
        .catch(err => {
          console.error(`Erro na requisição ${i + 1}:`, err.response?.status || err.message);
        })
    );
  }

  console.log(`Enviando ${TOTAL_REQUISICOES} requisições GET...`);

  await Promise.all(promessas);

  console.log('Teste de GET concluído!');
};

testarRequisicoesGET();
