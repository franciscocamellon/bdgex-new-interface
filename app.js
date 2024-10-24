// Aguarda o carregamento completo do DOM antes de executar a função principal
document.addEventListener("DOMContentLoaded", function App() {
  "use strict"; // Modo estrito do JavaScript para garantir uma execução mais segura do código

  // Função para abrir/fechar os filtros
  function openFilter() {
    // Seleciona o elemento com o ID 'filter-container'
    const element = document.getElementById("filter-container");

    // Alterna a classe 'filter-container-active', abrindo ou fechando o filtro visualmente
    element.classList.toggle("filter-container-active");
  }

  // Adiciona um evento de clique ao ícone do filtro
  document.getElementById("filter-icon").addEventListener("click", openFilter);

  // Função para abrir/fechar o setup de camadas
  function openLayerSetup() {
    // Seleciona o elemento com o ID 'layer-container'
    const element = document.getElementById("layer-container");

    // Alterna a classe 'layer-container-active', abrindo ou fechando a configuração de camadas visualmente
    element.classList.toggle("layer-container-active");
  }

  // Adiciona um evento de clique ao ícone de camadas
  document
    .getElementById("layer-icon")
    .addEventListener("click", openLayerSetup);

  // Função para abrir ou fechar o carrinho de compras
  function openShoppingCart(close) {
    // Seleciona o elemento com o ID 'shopping-cart'
    const element = document.getElementById("shopping-cart");

    // Se o parâmetro 'close' for verdadeiro, mostra o carrinho, caso contrário, oculta
    close
      ? (element.style.display = "block") // Mostra o carrinho
      : (element.style.display = "none"); // Esconde o carrinho
  }

  // Adiciona um evento de clique ao ícone do carrinho para abri-lo
  document
    .getElementById("cart-icon")
    .addEventListener("click", () => openShoppingCart(true));

  // Adiciona um evento de clique ao botão de fechar o carrinho para escondê-lo
  document
    .getElementById("btn-close")
    .addEventListener("click", () => openShoppingCart(false));
});
