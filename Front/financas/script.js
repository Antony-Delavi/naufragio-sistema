document.addEventListener('DOMContentLoaded', () => {
  const vendasContainer = document.getElementById('vendas-container');
  const filtroPeriodo = document.getElementById('filtro-periodo');
  let vendasOriginais = [];

  // URL base da API
  const API_BASE_URL = 'https://sistema-loja-fvgq.onrender.com/vendas';
  // const API_BASE_URL = 'http://localhost:3000/vendas'; // Descomente para testes locais

  // Formata Date para YYYY-MM-DD
  const formatarData = (date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  // Formata Date para MM.AA
  const formatarMes = (date) => {
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = String(date.getFullYear()).slice(-2);
    return `${mes}.${ano}`;
  };

  // Gera lista de MM.AA para intervalo de meses
  const gerarMesesIntervalo = (mesesAtras) => {
    const hoje = new Date();
    const meses = [];
    for (let i = 0; i < mesesAtras; i++) {
      const data = new Date(hoje);
      data.setMonth(hoje.getMonth() - i);
      meses.push(formatarMes(data));
    }
    return meses;
  };

  // Carregar vendas
  async function carregarVendas() {
    try {
      console.log('Iniciando carregamento de vendas...');
      const response = await fetch(`${API_BASE_URL}/buscarvendas`);
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }
      const vendas = await response.json();
      console.log('Vendas recebidas:', vendas);

      if (!Array.isArray(vendas)) {
        throw new Error('Resposta inválida: dados não são um array');
      }

      console.log('Datas disponíveis:', vendas.map(v => ({
        dataCadastro: v.dataCadastro,
        mesCadastro: v.mesCadastro,
        anoCadastro: v.anoCadastro
      })));

      vendasOriginais = vendas;
      filtrarPorPeriodo();
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      alert('Erro ao carregar vendas. Verifique o console para detalhes.');
      vendasContainer.innerHTML = '<p class="text-danger">Falha ao carregar vendas.</p>';
    }
  }

  // Filtrar vendas por período
  function filtrarPorPeriodo() {
    const periodo = filtroPeriodo.value;
    const hoje = new Date();
    let vendasFiltradas = [...vendasOriginais];

    console.log(`Filtrando por período: ${periodo}`);

    if (periodo === 'dia') {
      const diaAtual = formatarData(hoje);
      vendasFiltradas = vendasOriginais.filter(v => {
        const dataVenda = v.dataCadastro;
        const match = dataVenda === diaAtual;
        console.log(`Dia - Comparando "${dataVenda}" com "${diaAtual}": ${match}`);
        return match;
      });
      if (vendasFiltradas.length === 0) {
        console.log(`Nenhuma venda encontrada para ${diaAtual}`);
      }
    } else if (periodo === 'semana') {
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - (hoje.getDay() || 7) + 1);
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);

      const datasSemana = [];
      for (let d = new Date(inicioSemana); d <= fimSemana; d.setDate(d.getDate() + 1)) {
        datasSemana.push(formatarData(d));
      }
      console.log('Datas da semana:', datasSemana);

      vendasFiltradas = vendasOriginais.filter(v => {
        const dataVenda = v.dataCadastro;
        const match = datasSemana.includes(dataVenda);
        console.log(`Semana - Comparando "${dataVenda}" com ${datasSemana}: ${match}`);
        return match;
      });
      if (vendasFiltradas.length === 0) {
        console.log('Nenhuma venda encontrada na semana');
      }
    } else if (periodo === 'mes') {
      const mesAtual = formatarMes(hoje);
      vendasFiltradas = vendasOriginais.filter(v => {
        const mesVenda = v.mesCadastro;
        const match = mesVenda === mesAtual;
        console.log(`Mês - Comparando "${mesVenda}" com "${mesAtual}": ${match}`);
        return match;
      });
      if (vendasFiltradas.length === 0) {
        console.log(`Nenhuma venda encontrada para ${mesAtual}`);
      }
    } else if (periodo === '3meses') {
      const mesesValidos = gerarMesesIntervalo(3);
      console.log('Meses válidos (3 meses):', mesesValidos);
      vendasFiltradas = vendasOriginais.filter(v => {
        const mesVenda = v.mesCadastro;
        const match = mesesValidos.includes(mesVenda);
        console.log(`3 Meses - Comparando "${mesVenda}" com ${mesesValidos}: ${match}`);
        return match;
      });
      if (vendasFiltradas.length === 0) {
        console.log('Nenhuma venda encontrada nos últimos 3 meses');
      }
    } else if (periodo === '6meses') {
      const mesesValidos = gerarMesesIntervalo(6);
      console.log('Meses válidos (6 meses):', mesesValidos);
      vendasFiltradas = vendasOriginais.filter(v => {
        const mesVenda = v.mesCadastro;
        const match = mesesValidos.includes(mesVenda);
        console.log(`6 Meses - Comparando "${mesVenda}" com ${mesesValidos}: ${match}`);
        return match;
      });
      if (vendasFiltradas.length === 0) {
        console.log('Nenhuma venda encontrada nos últimos 6 meses');
      }
    } else if (periodo === 'ano') {
      const anoAtual = String(hoje.getFullYear());
      vendasFiltradas = vendasOriginais.filter(v => {
        const anoVenda = v.anoCadastro;
        const match = anoVenda === anoAtual;
        console.log(`Ano - Comparando "${anoVenda}" com "${anoAtual}": ${match}`);
        return match;
      });
      if (vendasFiltradas.length === 0) {
        console.log(`Nenhuma venda encontrada para ${anoAtual}`);
      }
    }

    console.log(`Vendas filtradas por ${periodo}:`, vendasFiltradas);
    atualizarResumo(vendasFiltradas);
    atualizarVendas(vendasFiltradas);
    atualizarGraficos(vendasFiltradas);
  }

  // Atualizar resumo financeiro
  function atualizarResumo(vendas) {
    try {
      const totalVendas = vendas.reduce((acc, v) => acc + (Number(v.valorProduto) - Number(v.desconto || 0)), 0);
      const descontoMedio = vendas.length > 0 ? vendas.reduce((acc, v) => acc + Number(v.desconto || 0), 0) / vendas.length : 0;

      document.getElementById('total-vendas').textContent = `R$ ${totalVendas.toFixed(2)}`;
      document.getElementById('numero-vendas').textContent = vendas.length;
      document.getElementById('desconto-medio').textContent = `R$ ${descontoMedio.toFixed(2)}`;

      console.log('Resumo atualizado:', { totalVendas, numeroVendas: vendas.length, descontoMedio });
    } catch (error) {
      console.error('Erro ao atualizar resumo:', error);
      alert('Erro ao atualizar resumo.');
    }
  }

  // Atualizar lista de vendas
  function atualizarVendas(vendas) {
    try {
      vendasContainer.innerHTML = '';

      if (vendas.length === 0) {
        vendasContainer.innerHTML = '<p class="text-muted">Nenhuma venda encontrada.</p>';
        return;
      }

      const vendasOrdenadas = [...vendas].sort((a, b) => {
        const dataA = new Date(a.dataCadastro || '1970-01-01');
        const dataB = new Date(b.dataCadastro || '1970-01-01');
        return dataB - dataA;
      });

      vendasOrdenadas.forEach(venda => {
        const card = document.createElement('div');
        card.className = 'venda-card';
        card.innerHTML = `
          <div class="card-body">
            <h6 class="card-title">${venda.nomeProduto || 'N/A'}</h6>
            <p class="mb-1">${venda.categoria || 'N/A'}</p>
            <p class="mb-1">Valor: R$ ${(Number(venda.valorProduto) || 0).toFixed(2)}</p>
            <p class="mb-1">Desconto: R$ ${(Number(venda.desconto) || 0).toFixed(2)}</p>
            <p class="venda-data"><small>Data: ${venda.dataCadastro || 'N/A'}</small></p>
            <button class="btn btn-outline-danger btn-sm mt-2" onclick="deletarVenda('${venda._id || ''}')">Deletar</button>
          </div>
        `;
        vendasContainer.appendChild(card);
      });

      console.log('Lista de vendas atualizada:', vendas.length);
    } catch (error) {
      console.error('Erro ao atualizar vendas:', error);
      alert('Erro ao atualizar lista de vendas.');
    }
  }

  // Atualizar gráficos
  function atualizarGraficos(vendas) {
    try {
      const canvasVendas = document.getElementById('grafico-vendas');
      const canvasCategorias = document.getElementById('grafico-categorias');
      if (canvasVendas.chart) canvasVendas.chart.destroy();
      if (canvasCategorias.chart) canvasCategorias.chart.destroy();

      // Gráfico de Vendas por Data
      const vendasPorData = {};
      vendas.forEach(v => {
        const data = v.dataCadastro || 'Sem data';
        vendasPorData[data] = (vendasPorData[data] || 0) + (Number(v.valorProduto) - Number(v.desconto || 0));
      });

      const ctxVendas = canvasVendas.getContext('2d');
      canvasVendas.chart = new Chart(ctxVendas, {
        type: 'bar',
        data: {
          labels: Object.keys(vendasPorData),
          datasets: [{
            label: 'Vendas Líquidas (R$)',
            data: Object.values(vendasPorData),
            backgroundColor: '#00d1ff',
            borderColor: '#80deea',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true }
          }
        }
      });

      // Gráfico de Categorias
      const categorias = {};
      vendas.forEach(v => {
        const cat = v.categoria || 'Sem categoria';
        categorias[cat] = (categorias[cat] || 0) + 1;
      });

      const ctxCategorias = canvasCategorias.getContext('2d');
      canvasCategorias.chart = new Chart(ctxCategorias, {
        type: 'pie',
        data: {
          labels: Object.keys(categorias),
          datasets: [{
            data: Object.values(categorias),
            backgroundColor: ['#00d1ff', '#28a745', '#dc3545', '#ffc107', '#b0bec5']
          }]
        }
      });

      console.log('Gráficos atualizados:', { vendasPorData, categorias });
    } catch (error) {
      console.error('Erro ao atualizar gráficos:', error);
      alert('Erro ao atualizar gráficos.');
    }
  }

  // Deletar venda
  window.deletarVenda = async function(id) {
    if (!id) {
      alert('ID da venda inválido.');
      return;
    }

    if (confirm('Deseja deletar esta venda?')) {
      try {
        console.log(`Tentando deletar venda com ID: ${id}`);
        const response = await fetch(`${API_BASE_URL}/deletar/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error(`Erro ao deletar: ${response.status} ${response.statusText}`);
        }
        console.log('Venda deletada com sucesso');
        carregarVendas();
      } catch (error) {
        console.error('Erro ao deletar venda:', error);
        alert('Erro ao deletar venda. Verifique o console.');
      }
    }
  };

  // Event listeners
  filtroPeriodo.addEventListener('change', filtrarPorPeriodo);

  // Carregar vendas iniciais
  console.log('Inicializando dashboard...');
  carregarVendas();
});