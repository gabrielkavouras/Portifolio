const $ = (seletor) => document.querySelector(seletor);
const status = $("#status");
const dizer = (mensagem) => { status.textContent = mensagem; };

// Tema escuro (5.1)
$("#tema").addEventListener("click", () => {
  const escuro = document.body.classList.toggle("escuro");
  $("#tema").setAttribute("aria-pressed", String(escuro));
  $("#tema").textContent = escuro ? "Tema claro" : "Alternar tema";
});

// Mostrar mais / menos com hidden e aria-expanded (parte A)
$("#mais").addEventListener("click", () => {
  const extra = $("#extra");
  extra.hidden = !extra.hidden;
  $("#mais").setAttribute("aria-expanded", String(!extra.hidden));
  $("#mais").textContent = extra.hidden ? "Mostrar mais" : "Mostrar menos";
});

// Filtro: faz nova seleção a cada chamada, então vale para cards novos (6.2)
function filtrar() {
  const categoria = $("#filtro").value;
  let visiveis = 0;
  document.querySelectorAll(".projeto").forEach((card) => {
    card.hidden = !(categoria === "todos" || card.dataset.categoria === categoria);
    if (!card.hidden) visiveis++;
  });
  $("#contador").textContent = "Projetos visíveis: " + visiveis; // alteração de autoria (parte C)
}

// Criação do card com textContent, sem innerHTML (6.1 e teste de segurança)
function criarCard(nome, categoria) {
  const card = document.createElement("article");
  card.className = "projeto";
  card.dataset.categoria = categoria;
  const titulo = document.createElement("h2");
  titulo.textContent = nome;
  const texto = document.createElement("p");
  texto.textContent = "Categoria: " + categoria;
  const botao = document.createElement("button");
  botao.className = "remover";
  botao.type = "button";
  botao.textContent = "Remover";
  card.append(titulo, texto, botao);
  return card;
}

// Cadastro (6.1)
$("#cadastro").addEventListener("submit", (evento) => {
  evento.preventDefault();
  const formulario = evento.target;
  if (!formulario.checkValidity()) { formulario.reportValidity(); return; }
  const dados = new FormData(formulario);
  const nome = dados.get("nome").trim();
  const categoria = dados.get("categoria");
  if (nome.length < 3) { dizer("O nome precisa ter pelo menos 3 caracteres."); return; }
  $("#projetos").append(criarCard(nome, categoria));
  filtrar();
  $("#nome").value = "";
  dizer("Projeto \"" + nome + "\" adicionado.");
  $("#nome").focus();
});

$("#filtro").addEventListener("change", () => { filtrar(); dizer("Filtro: " + $("#filtro").value); });

// Remoção por delegação: um único listener no contêiner (6.3)
$("#projetos").addEventListener("click", (evento) => {
  const botao = evento.target.closest(".remover");
  if (!botao) return;
  const card = botao.closest(".projeto");
  const nome = card.querySelector("h2").textContent;
  card.remove();
  filtrar();
  dizer("Projeto \"" + nome + "\" removido.");
});

filtrar();
