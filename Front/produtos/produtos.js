const produtosDisponiveis = document.getElementById('produtos-disponiveis');
const produtosIndisponiveis = document.getElementById('produtos-indisponiveis');
const searchInput = document.getElementById('searchInput');

let produtos = [];

function carregarProdutos() {
  fetch('https://naufragio.onrender.com/produtos/buscar')
    .then(res => res.json())
    .then(data => {
      produtos = data;
      renderizarProdutos(produtos);
    })
    .catch(err => {
      console.error('Erro ao carregar produtos:', err);
      alert('Erro ao carregar produtos.');
    });
}

function renderizarProdutos(produtos) {
  produtosDisponiveis.innerHTML = '';
  produtosIndisponiveis.innerHTML = '';

  produtos.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'card-produto';

    const badgeClass = produto.disponivel ? 'bg-success' : 'bg-danger';
    const badgeText = produto.disponivel ? 'Disponível' : 'Indisponível';

    card.innerHTML = `
      <div class="card-body">
        <h6 class="card-title">${produto.nomeProduto}</h6>
        <p class="mb-1">${produto.categoria}</p>
        <span class="badge ${badgeClass} mb-2">${badgeText}</span><br>
        <small>R$ ${produto.preco.toFixed(2)}</small>
        <div class="mt-auto d-flex gap-2">
          ${produto.disponivel ? `<button onclick="venderProduto('${encodeURIComponent(produto.nomeProduto)}')" class="btn btn-sm btn-outline-success">💸</button>` : ''}
          ${!produto.disponivel ? `<button onclick="reembolsarProduto('${produto._id}', '${encodeURIComponent(produto.nomeProduto)}')" class="btn btn-sm btn-outline-warning">🔄</button>` : ''}
          <button onclick="apagarProduto('${produto._id}')" class="btn btn-sm btn-outline-danger">🗑️</button>
        </div>
        <div class="detalhes-produto">
          ${produto.imagem ? `<img src="${produto.imagem}" alt="${produto.nomeProduto}" />` : '<p>Sem imagem</p>'}
          <p><strong>Marca:</strong> ${produto.marca || 'Sem marca'}</p>
          <p><strong>Estilo:</strong> ${produto.estilo || 'Sem estilo'}</p>
          <p><strong>Tamanho:</strong> ${produto.tamanho || 'Sem tamanho'}</p>
        </div>
      </div>
    `;

    if (produto.disponivel) {
      produtosDisponiveis.appendChild(card);
    } else {
      produtosIndisponiveis.appendChild(card);
    }

    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const detalhes = card.querySelector('.detalhes-produto');
      const isExpanded = detalhes.style.display === 'block';
      detalhes.style.display = isExpanded ? 'none' : 'block';
    });
  });
}

function venderProduto(nomeProduto) {
  nomeProduto = decodeURIComponent(nomeProduto);
  const desconto = prompt("Informe o desconto em reais (caso não haja, digite 0):");

  if (desconto === null || desconto === '') return;

  fetch('https://naufragio.onrender.com/vendas/criar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nomeProduto, desconto })
  })
    .then(res => res.json())
    .then(response => {
      if (response.erro) {
        alert(response.erro);
      } else {
        alert('Venda realizada com sucesso!');
        carregarProdutos();
      }
    })
    .catch(err => {
      console.error('Erro ao vender:', err);
      alert('Erro ao realizar a venda.');
    });
}

function reembolsarProduto(idProduto, nomeProduto) {
  nomeProduto = decodeURIComponent(nomeProduto);
  const confirmReembolso = confirm(`Tem certeza que deseja reembolsar "${nomeProduto}"? Isso tornará o produto disponível novamente e removerá a venda associada.`);

  if (confirmReembolso) {
    console.log(`Iniciando reembolso para produto ID: ${idProduto}, Nome: ${nomeProduto}`);
    
    fetch('https://naufragio.onrender.com/vendas/buscar')
      .then(res => {
        console.log('Resposta de /vendas/buscar:', res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`Erro ao buscar vendas: ${res.status}`);
        }
        return res.json();
      })
      .then(vendas => {
        console.log('Vendas recebidas:', vendas);
        const venda = vendas.find(v => v.nomeProduto === nomeProduto);
        if (!venda) {
          throw new Error('Nenhuma venda encontrada para este produto.');
        }
        console.log('Venda encontrada:', venda);

        return fetch(`https://naufragio.onrender.com/vendas/deletar/${venda._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(res => {
            console.log('Resposta de /vendas/deletar:', res.status, res.statusText);
            if (!res.ok) {
              return res.text().then(text => { throw new Error(`Erro ao deletar venda: ${text}`); });
            }
            return res.json();
          })
          .then(response => {
            console.log('Venda deletada:', response);
            return fetch(`https://naufragio.onrender.com/produtos/atualizar/${idProduto}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ disponivel: true })
            });
          });
      })
      .then(res => {
        console.log('Resposta de /produtos/atualizar:', res.status, res.statusText);
        if (!res.ok) {
          return res.text().then(text => { throw new Error(`Erro ao atualizar produto: ${text}`); });
        }
        return res.json();
      })
      .then(response => {
        console.log('Produto atualizado:', response);
        alert(response.message || 'Produto reembolsado com sucesso! Disponível novamente.');
        carregarProdutos();
      })
      .catch(err => {
        console.error('Erro ao reembolsar:', err);
        alert(`Erro ao reembolsar: ${err.message}`);
      });
  }
}

function apagarProduto(id) {
  const produto = produtos.find(p => p._id === id);
  const nomeProduto = produto ? produto.nomeProduto : 'Produto';
  const confirmDelete = confirm(`Tem certeza que deseja apagar o produto "${nomeProduto}"?`);
  
  if (confirmDelete) {
    fetch(`https://naufragio.onrender.com/produtos/deletar/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message || 'Erro desconhecido'); });
      }
      return res.json();
    })
    .then(response => {
      alert(response.message || 'Produto apagado com sucesso!');
      carregarProdutos();
    })
    .catch(err => {
      console.error('Erro ao apagar produto:', err);
      alert(`Erro ao apagar o produto: ${err.message}`);
    });
  }
}

searchInput.addEventListener('input', function() {
  const query = searchInput.value.toLowerCase();

  const produtosFiltrados = produtos.filter(produto => {
    return (
      produto.nomeProduto.toLowerCase().includes(query) ||
      produto.categoria.toLowerCase().includes(query) ||
      produto.marca.toLowerCase().includes(query)
    );
  });

  renderizarProdutos(produtosFiltrados);
});

carregarProdutos();