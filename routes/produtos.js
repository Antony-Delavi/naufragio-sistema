document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = 'https://naufragio-sistema.onrender.com/produtos'; // Substitua pela URL correta da sua API

  // Função para carregar os produtos da API
  async function carregarProdutos() {
      try {
          const response = await fetch(`${apiUrl}/buscar`);

          // Verificar se a resposta foi bem-sucedida (status 200-299)
          if (!response.ok) {
              throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
          }

          const produtos = await response.json();

          // Verifique os dados no console
          console.log("Produtos recebidos:", produtos);

          // Selecionando os containers para produtos disponíveis e não disponíveis
          const containerDisponiveis = document.getElementById('produtos-disponiveis');
          const containerIndisponiveis = document.getElementById('produtos-indisponiveis');

          // Limpando os containers antes de adicionar os produtos
          containerDisponiveis.innerHTML = '';
          containerIndisponiveis.innerHTML = '';

          // Separando os produtos disponíveis dos não disponíveis
          const disponiveis = produtos.filter(produto => produto.disponivel);
          const indisponiveis = produtos.filter(produto => !produto.disponivel);

          // Exibindo produtos disponíveis
          disponiveis.forEach(produto => {
              const produtoCard = criarCardProduto(produto);
              containerDisponiveis.appendChild(produtoCard);
          });

          // Exibindo produtos indisponíveis
          indisponiveis.forEach(produto => {
              const produtoCard = criarCardProduto(produto);
              containerIndisponiveis.appendChild(produtoCard);
          });

      } catch (error) {
          console.error('Erro ao carregar produtos:', error);
          alert('Erro ao carregar os produtos, verifique o console para mais detalhes.');
      }
  }

  // Função para criar o card do produto
  function criarCardProduto(produto) {
      const card = document.createElement('div');
      card.classList.add('card', 'mb-3');

      // Corpo do card com nome, categoria, preço e disponibilidade
      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');
      card.appendChild(cardBody);

      const nome = document.createElement('h5');
      nome.classList.add('card-title');
      nome.textContent = produto.nomeProduto;
      cardBody.appendChild(nome);

      const categoria = document.createElement('p');
      categoria.classList.add('card-text');
      categoria.textContent = `Categoria: ${produto.categoria}`;
      cardBody.appendChild(categoria);

      const preco = document.createElement('p');
      preco.classList.add('card-text');
      preco.textContent = `Preço: R$ ${produto.preco.toFixed(2)}`;
      cardBody.appendChild(preco);

      const disponibilidade = document.createElement('p');
      disponibilidade.classList.add('card-text');
      disponibilidade.textContent = produto.disponivel ? 'Disponível' : 'Indisponível';
      cardBody.appendChild(disponibilidade);

      // Botão de expandir para mostrar mais informações
      const btnExpandir = document.createElement('button');
      btnExpandir.classList.add('btn', 'btn-link');
      btnExpandir.textContent = 'Expandir';
      btnExpandir.addEventListener('click', () => {
          const detalhes = document.getElementById(`detalhes-${produto._id}`);
          detalhes.classList.toggle('d-none');
      });
      cardBody.appendChild(btnExpandir);

      // Detalhes adicionais
      const detalhes = document.createElement('div');
      detalhes.id = `detalhes-${produto._id}`;
      detalhes.classList.add('d-none', 'mt-3');

      const cores = document.createElement('p');
      cores.textContent = `Cores disponíveis: ${produto.cores}`;
      detalhes.appendChild(cores);

      const marca = document.createElement('p');
      marca.textContent = `Marca: ${produto.marca}`;
      detalhes.appendChild(marca);

      const estilo = document.createElement('p');
      estilo.textContent = `Estilo: ${produto.estilo}`;
      detalhes.appendChild(estilo);

      const tamanho = document.createElement('p');
      tamanho.textContent = `Tamanho: ${produto.tamanho}`;
      detalhes.appendChild(tamanho);

      card.appendChild(detalhes);

      // Botão de deletar produto
      const btnDeletar = document.createElement('button');
      btnDeletar.classList.add('btn', 'btn-danger', 'mt-3');
      btnDeletar.textContent = 'Deletar Produto';
      btnDeletar.addEventListener('click', () => {
          deletarProduto(produto._id);
      });
      cardBody.appendChild(btnDeletar);

      return card;
  }

  // Função para deletar o produto
  async function deletarProduto(id) {
      try {
          const response = await fetch(`${apiUrl}/deletar/${id}`, {
              method: 'DELETE'
          });

          if (response.ok) {
              alert('Produto deletado com sucesso!');
              // Atualize a lista de produtos após deletar
              carregarProdutos();
          } else {
              alert('Erro ao deletar o produto.');
          }
      } catch (error) {
          console.error('Erro ao deletar o produto:', error);
          alert('Erro ao deletar o produto.');
      }
  }

  // Carregar os produtos ao carregar a página
  carregarProdutos();
});