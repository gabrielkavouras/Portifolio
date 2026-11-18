// ===== Dados dos projetos (fonte única; o HTML é gerado a partir daqui) =====
const PROJETOS = [
  { nome: "Meu primeiro site", descricao: "Portfólio em HTML semântico com tabela, cards e formulário (aula 06).", tecnologias: ["HTML"], link: "primeiro-site/index.html", rotulo: "Ver o primeiro site" },
  { nome: "Portfólio pessoal", descricao: "Este portfólio, estilizado com CSS, Flexbox e media queries (aulas 07 e 10).", tecnologias: ["HTML", "CSS", "JavaScript"], link: "index.html", rotulo: "Ver o portfólio" },
  { nome: "Laboratório de DOM e eventos", descricao: "Cadastro, filtro e remoção de projetos com delegação de eventos.", tecnologias: ["HTML", "CSS", "JavaScript"], link: "laboratorio-dom/index.html", rotulo: "Ver o laboratório" }
];
const FILTROS = ["Todos", "HTML", "CSS", "JavaScript"];
const $ = (seletor) => document.querySelector(seletor);

// ===== Menu móvel =====
$("#btn-menu").addEventListener("click", () => {
  const aberto = $("#menu").classList.toggle("aberto");
  $("#btn-menu").setAttribute("aria-expanded", String(aberto));
});

// ===== Projetos e filtro =====
function criarCard(projeto) {
  const card = document.createElement("article");
  card.className = "card";
  const titulo = document.createElement("h3");
  titulo.textContent = projeto.nome;
  const desc = document.createElement("p");
  desc.textContent = projeto.descricao;
  const tec = document.createElement("p");
  tec.textContent = "Tecnologias: " + projeto.tecnologias.join(", ");
  const link = document.createElement("a");
  link.className = "botao";
  link.href = projeto.link;
  link.textContent = projeto.rotulo;
  card.append(titulo, desc, tec, link);
  return card;
}

function mostrarProjetos(filtro) {
  const visiveis = PROJETOS.filter((p) => filtro === "Todos" || p.tecnologias.includes(filtro));
  $("#lista-projetos").replaceChildren(...visiveis.map(criarCard));
  $("#sem-resultado").hidden = visiveis.length > 0;
  $("#contagem").textContent = visiveis.length + " projeto(s) encontrado(s) para: " + filtro;
  document.querySelectorAll(".filtro").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filtro === filtro)));
}

function criarFiltros() {
  FILTROS.forEach((nome) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "filtro";
    b.dataset.filtro = nome;
    b.textContent = nome;
    b.addEventListener("click", () => mostrarProjetos(nome));
    $("#filtros").append(b);
  });
}

// ===== Formulário: leitura e normalização =====
// Critério único de contagem: caracteres Unicode após trim().
const contar = (texto) => [...texto.trim()].length;
const CAMPOS = ["nome", "email", "motivo", "assunto", "mensagem"];

function lerDados() {
  const dados = {};
  CAMPOS.forEach((id) => { dados[id] = $("#" + id).value; });
  return dados;
}

// ===== Formulário: validação (retorna texto do erro ou "") =====
function intervalo(texto, min, max, rotulo) {
  const n = contar(texto);
  if (n === 0) return rotulo + " é obrigatório.";
  if (n < min) return rotulo + " precisa de pelo menos " + min + " caracteres (atual: " + n + ").";
  if (n > max) return rotulo + " aceita no máximo " + max + " caracteres (atual: " + n + ").";
  return "";
}

const REGRAS = {
  nome: (d) => intervalo(d.nome, 3, 80, "O nome"),
  email: (d) => {
    if (d.email.trim() === "") return "O e-mail é obrigatório.";
    return $("#email").validity.typeMismatch ? "Informe um e-mail em formato válido, como nome@dominio.com." : "";
  },
  motivo: (d) => (d.motivo === "" ? "Selecione um motivo de contato." : ""),
  assunto: (d) => (d.motivo === "Outro" ? intervalo(d.assunto, 5, 100, "O assunto") : ""),
  mensagem: (d) => intervalo(d.mensagem, 30, 1000, "A mensagem")
};

// ===== Formulário: apresentação de erros =====
function mostrarErro(id, texto) {
  const campo = $("#" + id);
  $("#erro-" + id).textContent = texto;
  if (texto) campo.setAttribute("aria-invalid", "true");
  else campo.removeAttribute("aria-invalid");
}

function validarCampo(id) {
  const texto = REGRAS[id](lerDados());
  mostrarErro(id, texto);
  return texto;
}

function validarTudo() {
  return CAMPOS.map((id) => ({ id, erro: validarCampo(id) })).filter((r) => r.erro);
}

function mostrarResumo(erros) {
  const resumo = $("#resumo");
  resumo.hidden = erros.length === 0;
  resumo.textContent = erros.length ? "Corrija " + erros.length + " problema(s): " + erros.map((e) => e.erro).join(" ") : "";
}

// ===== Regra condicional do assunto =====
function atualizarAssunto() {
  const outro = $("#motivo").value === "Outro";
  $("#grupo-assunto").hidden = !outro;
  $("#assunto").disabled = !outro;
  if (!outro) { $("#assunto").value = ""; mostrarErro("assunto", ""); }
}

// ===== Envio simulado (nenhum e-mail é enviado) =====
function enviarDemo(modo) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (modo === "sucesso" ? resolve() : reject(new Error("falha simulada"))), 1500);
  });
}

let enviando = false;
async function aoEnviar(evento) {
  evento.preventDefault();
  if (enviando) return;
  const erros = validarTudo();
  mostrarResumo(erros);
  if (erros.length) {
    $("#status").textContent = "Formulário com erros. Corrija e tente novamente.";
    $("#" + erros[0].id).focus();
    return;
  }
  enviando = true;
  $("#btn-enviar").disabled = true;
  $("#status").textContent = "Enviando (simulação)...";
  try {
    await enviarDemo($("#modo-teste").value);
    $("#status").textContent = "Sucesso na simulação. Nenhum e-mail foi enviado; use o contato real acima.";
    $("#form-contato").reset();
    atualizarAssunto();
    atualizarContador();
  } catch (e) {
    $("#status").textContent = "Falha na simulação. Seus dados foram mantidos; tente novamente.";
  } finally {
    enviando = false;
    $("#btn-enviar").disabled = false;
  }
}

function atualizarContador() { $("#contador").textContent = contar($("#mensagem").value) + "/1000"; }

// ===== Inicialização =====
const tocados = new Set();
function iniciarFormulario() {
  CAMPOS.forEach((id) => {
    const campo = $("#" + id);
    campo.addEventListener("blur", () => { tocados.add(id); validarCampo(id); });
    campo.addEventListener(id === "motivo" ? "change" : "input", () => {
      if (id === "motivo") atualizarAssunto();
      if (id === "mensagem") atualizarContador();
      $("#status").textContent = "";
      if (tocados.has(id) || campo.getAttribute("aria-invalid")) validarCampo(id);
    });
  });
  $("#form-contato").addEventListener("submit", aoEnviar);
}

criarFiltros();
mostrarProjetos("Todos");
iniciarFormulario();
