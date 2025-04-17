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
          ${produto.disponivel ? `<button onclick="venderProduto('${encodeURIComponent(produto.nomeProduto)}', ${produto.preco})" class="btn btn-sm btn-outline-success">💸</button>` : ''}
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

function gerarPayloadPix(chavePix, valor, nomeBeneficiario, cidade) {
  const payload = [
    "000201", // Payload Format Indicator
    "26580014BR.GOV.BCB.PIX",
    `0114${chavePix}`, // Chave PIX
    `52040000`, // Merchant Category Code
    `5303986`, // Currency (BRL)
    `54${valor.toFixed(2).padStart(8, '0')}`, // Transaction Amount
    `5802BR`, // Country Code
    `59${nomeBeneficiario.padEnd(25, ' ')}`, // Merchant Name
    `60${cidade.padEnd(15, ' ')}`, // Merchant City
    `62630521BR.COM.PIX.NFCE.RECEBIMENTO`, // Additional Data
    "6304" // CRC16 placeholder
  ].join("");

  // Calcula o CRC16
  const crc = calcularCRC16(payload).toString(16).toUpperCase().padStart(4, '0');
  return payload + crc;
}

function calcularCRC16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc;
}

function venderProduto(nomeProduto, precoOriginal) {
  nomeProduto = decodeURIComponent(nomeProduto);
  const desconto = prompt("Informe o desconto em reais (caso não haja, digite 0):");

  if (desconto === null || desconto === '') return;

  const descontoNum = parseFloat(desconto) || 0;
  if (descontoNum < 0) {
    alert('Desconto não pode ser negativo.');
    return;
  }

  const valorFinal = precoOriginal - descontoNum;
  if (valorFinal <= 0) {
    alert('O valor final após o desconto deve ser maior que zero.');
    return;
  }

  // Configurações do PIX (substitua com seus dados reais)
  const chavePix = "sua-chave-pix-aqui"; // Ex: CPF, e-mail ou chave aleatória
  const nomeBeneficiario = "Seu Nome"; // Nome do beneficiário
  const cidade = "Sua Cidade"; // Cidade do beneficiário

  const payloadPix = gerarPayloadPix(chavePix, valorFinal, nomeBeneficiario, cidade);

  // Exibe o modal com o QR Code
  const qrcodeContainer = document.getElementById('qrcode');
  qrcodeContainer.innerHTML = '';
  new QRCode(qrcodeContainer, {
    text: payloadPix,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  document.getElementById('valor-pix').textContent = `Valor a pagar: R$ ${valorFinal.toFixed(2)}`;
  const pixModal = new bootstrap.Modal(document.getElementById('pixModal'));
  pixModal.show();

  // Configura o botão Confirmar Pagamento
  const confirmarPagamento = document.getElementById('confirmarPagamento');
  confirmarPagamento.onclick = () => {
    fetch('https://naufragio.onrender.com/vendas/criar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nomeProduto, desconto: descontoNum })
    })
      .then(res => res.json())
      .then(response => {
        if (response.erro) {
          alert(response.erro);
        } else {
          alert('Venda realizada com sucesso!');
          carregarProdutos();
          pixModal.hide();
        }
      })
      .catch(err => {
        console.error('Erro ao vender:', err);
        alert('Erro ao realizar a venda.');
      });
  };
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