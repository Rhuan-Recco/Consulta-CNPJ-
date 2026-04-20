document.getElementById('FORM').addEventListener('submit',(e)=> {
  e.preventDefault();
  consultarCNPJ(); 
});

async function consultarCNPJ() {
  const cnpj = document.getElementById("cnpj").value.replace(/\D/g, "");
  const resultado = document.getElementById("resultado");

  if(!cnpj){
    resultadp.innerHTML = "";
    return;
  }
  resultado.innerHTML = "Consultando...";

  try {
    const resposta = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`);
    const dados = await resposta.json();

    if (!dados.razao_social) {
      resultado.innerHTML = "CNPJ não encontrado.";
      return;
    }

    resultado.innerHTML = "";
    
    const campos = {
      "Nome (empresarial)": dados.razao_social.toUpperCase(),
      "Nome (fantasia)": dados.estabelecimento?.nome_fantasia?.toUpperCase(),
      "Status": dados.estabelecimento?.situacao_cadastral,
      "CEP": dados.estabelecimento?.cep,
      "Logradouro": `${dados.estabelecimento?.tipo_logradouro?.toUpperCase() || ''} ${dados.estabelecimento?.logradouro?.toUpperCase() || ''}`,
      "Número": dados.estabelecimento?.numero,
      "Bairro": dados.estabelecimento?.bairro?.toUpperCase(),
      "Cidade": dados.estabelecimento?.cidade?.nome?.toUpperCase(),
      "Estado": dados.estabelecimento?.estado?.sigla?.toUpperCase(),
      "Telefone": dados.estabelecimento?.ddd1&&dados.estabelecimento?.telefone1 
              ? `(${dados.estabelecimento.ddd1})${dados.estabelecimento.telefone1}` 
              : null,
      "E-mail": dados.estabelecimento?.email,
      "Código Municipal": dados.estabelecimento?.cidade?.ibge_id
    };
    
    for (const [chave, valor] of Object.entries(campos)) {
      if (valor) {
        const linha = document.createElement("div");
        linha.className = "linha";

        const titulo = document.createElement("span");
        titulo.className = "titulo";
        titulo.textContent = `${chave}:`;

        const dado = document.createElement("span");
dado.className = "valor";
dado.textContent = valor;

const botao = document.createElement("button");
botao.textContent = "Copiar";
botao.onclick = () => copiar(valor);


if (chave === "Status" && valor.toLowerCase() !== "ativa") {
  botao.style.backgroundColor = "red";
  botao.style.color = "white";

  const alerta = document.createElement("span");
  alerta.textContent = "  ALERTA!";
  alerta.style.color = "red";
  alerta.style.fontWeight = "bold";
  alerta.style.marginLeft = "10px";

  dado.appendChild(alerta);
}

        linha.appendChild(titulo);
        linha.appendChild(dado);
        linha.appendChild(botao);
        resultado.appendChild(linha);
      }
    }

if (dados.estabelecimento?.inscricoes_estaduais?.length > 0) {
  dados.estabelecimento.inscricoes_estaduais.forEach((ie, index) => {
    const linha = document.createElement("div");
    linha.className = "linha";

    const titulo = document.createElement("span");
    titulo.className = "titulo";
    titulo.textContent = `Inscrição Estadual ${index + 1}:`;

    const dado = document.createElement("span");
    dado.className = "valor";
    dado.textContent = `${ie.inscricao_estadual ?? ""} - ${ie.ativo ? "Ativa" : "Baixada"} - ${ie.estado?.sigla ?? ""}`;

    if (ie.ativo && ie.estado?.sigla === dados.estabelecimento?.estado?.sigla) {
      dado.classList.add("valor-ativo");
    }

    linha.appendChild(titulo);
    linha.appendChild(dado);

    if (ie.ativo) {
  const botao = document.createElement("button");
  botao.textContent = "Copiar";

  if (ie.estado?.sigla !== dados.estabelecimento?.estado?.sigla) {
    botao.style.backgroundColor = "red";
    botao.style.color = "white";
    botao.onclick = () => {
      copiar(ie.inscricao_estadual ?? "");
      alert("Foi copiada a IE de outro estado!");
    };
  } else {
    botao.style.backgroundColor = "#0066cc";
    botao.style.color = "white";
    botao.onclick = () => copiar(ie.inscricao_estadual ?? "");
  }

  linha.appendChild(botao);
}
    resultado.appendChild(linha);
  });
}


  } catch (erro) {
    resultado.innerHTML = "Erro ao consultar CNPJ.";
    console.log(erro);
  }
}

function copiar(texto) {
  navigator.clipboard.writeText(texto).then(() => {
    const aviso = document.createElement("div");
    aviso.textContent = "Copiado!";
    aviso.style.position = "fixed";
    aviso.style.bottom = "20px";
    aviso.style.left = "50%";
    aviso.style.transform = "translateX(-50%)";
    aviso.style.background = "#4caf50";
    aviso.style.color = "white";
    aviso.style.padding = "8px 12px";
    aviso.style.borderRadius = "5px";
    aviso.style.zIndex = "1000";
    document.body.appendChild(aviso);
    setTimeout(() => aviso.remove(), 1500);
  }).catch(err => {
    console.error("Erro ao copiar: ", err);
  });
}

function limparTudo() {
  document.getElementById("cnpj").value = "";
  document.getElementById("resultado").innerHTML = "";
}

function copiarCNPJ() {
  const campo = document.getElementById("cnpj");
  const cnpj = campo.value.trim().replace(/\D/g,"");

  if (cnpj) {
    copiar(cnpj); 
  } else {
    alert("Digite um CNPJ antes de copiar!");
  }
}

const menuBtn = document.querySelector(".menu-hamburguer");
const menuLateral = document.getElementById("menu-lateral");
const fecharBtn = document.querySelector(".fechar-menu");

menuBtn.addEventListener("click", () => {
  menuLateral.classList.toggle("aberto");
});

fecharBtn.addEventListener("click", () => {
  menuLateral.classList.remove("aberto");
});


// Fecha o menu ao clicar fora dele
document.addEventListener("click", (e) => {
  // Verifica se o menu está aberto
  if (menuLateral.classList.contains("aberto")) {
    // Se o clique não foi dentro do menu nem no botão hamburguer
    if (!menuLateral.contains(e.target) && !e.target.closest(".menu-hamburguer")) {
      menuLateral.classList.remove("aberto");
    }
  }
});



// Links do menu
const menuLista = document.getElementById('menu-lista')
for (let li of menuLista.children) {
  li.addEventListener('click', ()=>{
    document.getElementById("menu-lateral").classList.remove("aberto");
  })
}

const textoEsquerda = document.getElementById("texto-esquerda");
const textoDireita = document.getElementById("texto-direita");

textoEsquerda.addEventListener("input", () => {
  const texto = textoEsquerda.value;
  textoDireita.value = removerAcentos(texto).toUpperCase();
});

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function mostrarConsulta() {
  document.getElementById("tela-consulta").style.display = "block";
  document.getElementById("tela-outra").style.display = "none";

  document.querySelector(".top h1").textContent = "Consulta CNPJ + IE";
}

function mostrarOutraTela() {
  document.getElementById("tela-consulta").style.display = "none";
  document.getElementById("tela-outra").style.display = "flex";

  document.querySelector(".top h1").textContent = "Conversão m p/ M";
}

// Liga os links do menu às funções
document.querySelector("#consultar a").addEventListener("click", (e) => {
  e.preventDefault();
  mostrarConsulta();
});

document.querySelector("#outra-tela a").addEventListener("click", (e) => {
  e.preventDefault();
  mostrarOutraTela();
});

