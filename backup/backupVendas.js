const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { google } = require('googleapis');

// CONFIGURAÇÕES
const KEYFILEPATH = path.join(__dirname, '../configs/drivekeys.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const LISTAR_VENDAS_URL = 'https://naufragio.onrender.com/vendas/buscarvendas';
const PASTA_ID_DRIVE_MAE = '1WSlU6ibhEMI7hd1BUOenMLi3r1CgEEI4';

// Autenticação
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

async function criarPastaNoDrive(nomePasta, parentId) {
  const drive = google.drive({ version: 'v3', auth: await auth.getClient() });

  const pasta = await drive.files.create({
    resource: {
      name: nomePasta,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });

  return pasta.data.id;
}

async function enviarArquivo(caminhoArquivo, nomeArquivo, pastaId) {
  const drive = google.drive({ version: 'v3', auth: await auth.getClient() });

  const fileMetadata = {
    name: nomeArquivo,
    parents: [pastaId],
  };

  const media = {
    mimeType: 'text/plain',
    body: fs.createReadStream(caminhoArquivo),
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
  });

  return `✅ Arquivo enviado: ${nomeArquivo}, ID: ${file.data.id}`;
}

async function fazerBackupVendas() {
  const logs = [];
  try {
    // 1. Buscar vendas
    logs.push('📡 Buscando vendas...');
    const response = await axios.get(LISTAR_VENDAS_URL);
    const vendas = response.data;
    logs.push(`✅ ${vendas.length} vendas encontradas`);

    // 2. Criar pasta temporária local
    const dataHoje = new Date().toISOString().split('T')[0];
    const pastaLocal = path.join(__dirname, 'pastasBackupVendas', dataHoje);
    fs.mkdirSync(pastaLocal, { recursive: true });
    logs.push(`📁 Pasta local criada: ${pastaLocal}`);

    // 3. Criar arquivos .txt para cada venda
    vendas.forEach((venda, i) => {
      const nomeArquivo = `${venda.id || 'venda'}_${i + 1}.txt`;
      const caminho = path.join(pastaLocal, nomeArquivo);
      fs.writeFileSync(caminho, JSON.stringify(venda, null, 2), 'utf-8');
      logs.push(`📄 Arquivo criado: ${nomeArquivo}`);
    });

    // 4. Criar pasta no Google Drive com a data
    const pastaDriveId = await criarPastaNoDrive(`Vendas_${dataHoje}`, PASTA_ID_DRIVE_MAE);
    logs.push(`📁 Pasta criada no Drive: Vendas_${dataHoje} (ID: ${pastaDriveId})`);

    // 5. Enviar arquivos da pasta local pro Drive
    const arquivos = fs.readdirSync(pastaLocal);
    for (const nomeArquivo of arquivos) {
      const caminho = path.join(pastaLocal, nomeArquivo);
      const log = await enviarArquivo(caminho, nomeArquivo, pastaDriveId);
      logs.push(log);
    }

    // 6. Apagar arquivos locais após o envio
    arquivos.forEach((nomeArquivo) => {
      fs.unlinkSync(path.join(pastaLocal, nomeArquivo));
      logs.push(`🗑️ Arquivo local apagado: ${nomeArquivo}`);
    });

    // 7. Apagar pasta local vazia
    fs.rmdirSync(pastaLocal);
    logs.push('📁 Pasta local apagada');

    logs.push('✅ Backup de vendas finalizado com sucesso!');
    return { status: 'success', logs };
  } catch (err) {
    logs.push(`❌ Erro durante o backup de vendas: ${err.message}`);
    return { status: 'error', logs, error: err.message };
  }
}

module.exports = { fazerBackupVendas };