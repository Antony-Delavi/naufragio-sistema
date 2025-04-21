const token = localStorage.getItem('token');
function isSigned() {
  if(!token) {
    window.location.href = '../index.html';
  } else{
    carregarVendas();
  }
}

isSigned();

const container = document.getElementById('vendas-container');
const resumos = document.getElementById('resumos');
const filtroInput = document.getElementById('filtro-vendas');
const filtroTipo = document.getElementById('filtro-tipo');

let vendasOriginais = [];

function carregarVendas() {
  fetch('https://naufragio.onrender.com/vendas/buscarvendas')
    .then(res => res.json())
    .then(vendas => {
      console.log('Vendas recebidas:', vendas);
      vendasOriginais = vendas;
      mostrarResumo(vendas);
      mostrarVendas(vendas);
    })
    .catch(err => {
      console.error('Erro ao carregar vendas:', err);
      alert('Erro ao carregar vendas.');
    });
}

function mostrarResumo(vendas) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diaAtual = hoje.toISOString().split('T')[0];

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  inicioMes.setHours(0, 0, 0, 0);

  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  fimMes.setHours(23, 59, 59, 999);

  const inicioTresMeses = new Date(hoje);
  inicioTresMeses.setDate(hoje.getDate() - 90);
  inicioTresMeses.setHours(0, 0, 0, 0);

  const fimTresMeses = new Date(hoje);
  fimTresMeses.setHours(23, 59, 59, 999);

  console.log('Dia:', diaAtual);
  console.log('Mês:', inicioMes.toLocaleDateString('pt-BR'), 'até', fimMes.toLocaleDateString('pt-BR'));
  console.log('Últimos 3 meses:', inicioTresMeses.toLocaleDateString('pt-BR'), 'até', fimTresMeses.toLocaleDateString('pt-BR'));

  function estaEntreDatas(dataVenda, inicio, fim) {
    const data = new Date(dataVenda);
    if (isNaN(data.getTime())) {
      console.error('Data inválida:', dataVenda);
      return false;
    }
    return data >= inicio && data <= fim;
  }

  let totalDia = 0, totalDiaSemDesconto = 0;
  let totalMes = 0, totalMesSemDesconto = 0;
  let totalTresMeses = 0, totalTresMesesSemDesconto = 0;

  vendas.forEach(v => {
    const dataVenda = v.dataCadastro.split('T')[0];
    console.log('Verificando venda:', v.nomeProduto, 'Data:', v.dataCadastro);

    const valorReal = v.valorProduto - v.desconto;
    const valorCheio = v.valorProduto;

    if (dataVenda === diaAtual) {
      totalDia += valorReal;
      totalDiaSemDesconto += valorCheio;
      console.log('Venda no dia:', v.nomeProduto, valorReal);
    }

    if (estaEntreDatas(v.dataCadastro, inicioMes, fimMes)) {
      totalMes += valorReal;
      totalMesSemDesconto += valorCheio;
      console.log('Venda no mês:', v.nomeProduto, valorReal);
    }

    if (estaEntreDatas(v.dataCadastro, inicioTresMeses, fimTresMeses)) {
      totalTresMeses += valorReal;
      totalTresMesesSemDesconto += valorCheio;
      console.log('Venda nos últimos 3 meses:', v.nomeProduto, valorReal);
    }
  });

  console.log('Totais calculados:');
  console.log('Dia:', { totalDia, totalDiaSemDesconto });
  console.log('Mês:', { totalMes, totalMesSemDesconto });
  console.log('Últimos 3 meses:', { totalTresMeses, totalTresMesesSemDesconto });

  resumos.innerHTML = `
    <div class="resumo-card">
      <h6>💵 Vendas do Dia</h6>
      <p>Total com desconto: <strong>R$ ${totalDia.toFixed(2)}</strong></p>
      <p>Sem desconto: <strong>R$ ${totalDiaSemDesconto.toFixed(2)}</strong></p>
    </div>
    <div class="resumo-card">
      <h6>🗓️ Vendas do Mês</h6>
      <p>Total com desconto: <strong>R$ ${totalMes.toFixed(2)}</strong></p>
      <p>Sem desconto: <strong>R$ ${totalMesSemDesconto.toFixed(2)}</strong></p>
    </div>
    <div class="resumo-card">
      <h6>📊 Vendas dos Últimos 3 Meses</h6>
      <p>Total com desconto: <strong>R$ ${totalTresMeses.toFixed(2)}</strong></p>
      <p>Sem desconto: <strong>R$ ${totalTresMesesSemDesconto.toFixed(2)}</strong></p>
    </div>
  `;
}

function mostrarVendas(vendas) {
  container.innerHTML = '';

  const vendasOrdenadas = [...vendas].sort((a, b) => {
    return new Date(b.dataCadastro) - new Date(a.dataCadastro);
  });

  vendasOrdenadas.forEach(venda => {
    const card = document.createElement('div');
    card.className = 'venda-card';

    card.innerHTML = `
      <div class="card-body">
        <h6 class="card-title">${venda.nomeProduto}</h6>
        <p class="mb-1">${venda.categoria}</p>
        <p class="mb-1">Valor: R$ ${venda.valorProduto.toFixed(2)}</p>
        <p class="mb-1">Desconto: R$ ${venda.desconto.toFixed(2)}</p>
        <p class="venda-data"><small>Data: ${new Date(venda.dataCadastro).toLocaleDateString('pt-BR')}</small></p>
      </div>
    `;

    container.appendChild(card);
  });
}

function filtrarVendas() {
  const termo = filtroInput.value.toLowerCase();
  const tipo = filtroTipo.value;

  const vendasFiltradas = vendasOriginais.filter(venda => {
    if (tipo === 'nome') {
      return venda.nomeProduto.toLowerCase().includes(termo);
    } else {
      return venda.categoria.toLowerCase().includes(termo);
    }
  });

  console.log('Vendas filtradas:', vendasFiltradas);
  mostrarResumo(vendasFiltradas);
  mostrarVendas(vendasFiltradas);
}

filtroInput.addEventListener('input', filtrarVendas);
filtroTipo.addEventListener('change', filtrarVendas);

carregarVendas();