document.addEventListener('DOMContentLoaded', () => {
    const inputProduto = document.getElementById('nomeProduto');
    const inputValor = document.getElementById('valorProduto');
    const searchResults = document.getElementById('search-results');
    let produtos = [];
  
    // Carregar produtos disponíveis
    fetch('https://naufragio-sistema.onrender.com/produtos/buscar')
      .then(res => res.json())
      .then(data => {
        produtos = data.filter(p => p.disponivel);
        console.log('Produtos carregados:', produtos);
      })
      .catch(err => {
        console.error('Erro ao carregar produtos:', err);
        const msg = document.getElementById('mensagem');
        msg.textContent = '⚠️ Erro ao carregar produtos.';
        msg.className = 'error';
      });
  
    // Pesquisa em tempo real
    inputProduto.addEventListener('input', () => {
      const query = inputProduto.value.toLowerCase().trim();
      searchResults.innerHTML = '';
      
      if (query.length < 1) {
        searchResults.classList.remove('show');
        return;
      }
  
      const resultados = produtos.filter(produto => 
        produto.nomeProduto.toLowerCase().includes(query) ||
        produto.categoria.toLowerCase().includes(query)
      );
  
      if (resultados.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item"><p>Nenhum produto encontrado</p></div>';
        searchResults.classList.add('show');
        return;
      }
  
      resultados.forEach(produto => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
          ${produto.imagem ? `<img src="${produto.imagem}" alt="${produto.nomeProduto}" />` : '<div style="width: 50px; height: 50px;"></div>'}
          <div>
            <p><strong>${produto.nomeProduto}</strong></p>
            <p>${produto.categoria}</p>
          </div>
        `;
        item.addEventListener('click', () => {
          inputProduto.value = produto.nomeProduto;
          inputValor.value = produto.preco.toFixed(2);
          searchResults.innerHTML = '';
          searchResults.classList.remove('show');
        });
        searchResults.appendChild(item);
      });
  
      searchResults.classList.add('show');
    });
  
    // Esconder resultados ao clicar fora
    document.addEventListener('click', (e) => {
      if (!inputProduto.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('show');
      }
    });
  });
  
  document.getElementById('form-venda').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const dados = Object.fromEntries(formData);
    const msg = document.getElementById('mensagem');
  
    // Garantir que desconto seja um número (0 se vazio)
    dados.desconto = dados.desconto ? parseFloat(dados.desconto) : 0;
  
    try {
      const resposta = await fetch('https://naufragio-sistema.onrender.com/vendas/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });
  
      if (resposta.ok) {
        msg.textContent = '✅ Venda registrada com sucesso!';
        msg.className = 'success';
        e.target.reset();
        document.getElementById('valorProduto').value = '';
      } else {
        const erro = await resposta.json();
        msg.textContent = `❌ Erro ao registrar venda: ${erro.erro || 'Desconhecido'}.`;
        msg.className = 'error';
      }
    } catch (err) {
      console.error('Erro ao enviar:', err);
      msg.textContent = '⚠️ Erro ao conectar com o servidor.';
      msg.className = 'error';
    }
  });