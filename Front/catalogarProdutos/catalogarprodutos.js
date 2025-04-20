const token = localStorage.getItem('token');
function isSigned() {
  if(!token) {
    window.location.href = '../index.html';
  }
}

isSigned();

document.getElementById("form-produto").addEventListener("submit", async function(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const dados = Object.fromEntries(formData);
  const msg = document.getElementById("mensagem");

  // Processar a imagem, se presente
  if (formData.get('imagem') && formData.get('imagem').size > 0) {
    try {
      const imagemComprimida = await comprimirImagem(formData.get('imagem'));
      dados.imagem = imagemComprimida;
    } catch (err) {
      console.error('Erro ao comprimir imagem:', err);
      msg.textContent = `⚠️ ${err.message || 'Erro ao processar a imagem.'}`;
      msg.className = "error";
      return;
    }
  } else {
    dados.imagem = '';
  }

  try {
    const resposta = await fetch('https://naufragio.onrender.com/produtos/criar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    if (resposta.ok) {
      msg.textContent = "✅ Produto cadastrado com sucesso!";
      msg.className = "success";
      e.target.reset();
    } else {
      const erro = await resposta.json();
      msg.textContent = `❌ Erro ao cadastrar produto: ${erro.erro || 'Desconhecido'}.`;
      msg.className = "error";
    }
  } catch (err) {
    console.error("Erro ao enviar:", err);
    msg.textContent = "⚠️ Erro ao conectar com o servidor.";
    msg.className = "error";
  }
});

async function comprimirImagem(file) {
  return new Promise((resolve, reject) => {
    // Validar tamanho inicial do arquivo (máximo 5MB para evitar travamentos)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('A imagem é muito grande (máximo 10 MB).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Redimensionar para largura máxima de 600px (reduz tamanho)
        let width = img.width;
        let height = img.height;
        const maxWidth = 400;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para JPEG com qualidade 0.7
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        const tamanhoKB = (base64.length * 0.75) / 1024; // Aproximação do tamanho em KB
        console.log('Tamanho da imagem comprimida:', tamanhoKB.toFixed(2), 'KB');

        if (tamanhoKB > 150) {
          reject(new Error('Imagem comprimida ainda muito grande (máximo 150 KB). Tente uma imagem menor.'));
        } else {
          resolve(base64);
        }
      };
      img.onerror = () => reject(new Error('Erro ao carregar a imagem.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}