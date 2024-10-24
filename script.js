document.addEventListener("DOMContentLoaded", function createMap() {
  "use strict";

  // Define a chave da API do MapTiler.
  maptilersdk.config.apiKey = "Cvi2oCtCQVY3qFwOvaT3";

  // Cria uma nova instância do mapa.
  // exemplo passo a passo no site https://docs.maptiler.com/sdk-js/examples/how-to-use/
  const map = new maptilersdk.Map({
    container: "map", // ID do contêiner HTML onde o mapa será renderizado.
    scaleControl: true, // Habilita o controle de escala no mapa.
    style: maptilersdk.MapStyle.VOYAGER, // Define o estilo do mapa como "Voyager".
    zoom: 8, // Define o nível de zoom inicial do mapa.
    geolocate: maptilersdk.GeolocationType.POINT, // Define o tipo de geolocalização como ponto.
  });

  // Função para aplicar os filtros às molduras
  // adaptado deste exemplo https://docs.maptiler.com/sdk-js/examples/filter-within-layer/
  function applyFilter(toReset) {
    const filters = {
      type: document.getElementById("typeFilter"), // Obtém o elemento de filtro por tipo.
      owner: document.getElementById("ownerFilter"), // Obtém o elemento de filtro por proprietário.
      scale: document.getElementById("scaleFilter"), // Obtém o elemento de filtro por escala.
      year: document.getElementById("yearFilter"), // Obtém o elemento de filtro por ano.
    };

    if (toReset) {
      // este bloco serve para resetar os filtros qdo clica no botão limpar filtros
      for (const key in filters) {
        filters[key].value = "";
      }
      // qdo limpa os filtros tem que reincluir toas as feições de volta,
      // então aqui cria um filtro padrão que inclui todos os dados
      let filter = ["all"];
      map.setFilter("cartas_25k_disponiveis", filter); // Aplica o filtro ao mapa.
    } else {
      let filter = ["all"];
      // aqui filtra pelas escolhas do usuário o da escala não tá funcionando
      if (filters.type.value) {
        filter.push(["==", "type", filters.type.value]);
      }
      if (filters.owner.value) {
        filter.push(["==", "owner", filters.owner.value]);
      }
      if (filters.scale.value) {
        const scaleValue = parseInt(filters.scale.value);
        if (!isNaN(scaleValue)) {
          filter.push(["==", "scale", scaleValue]);
        }
      }
      if (filters.year.value) {
        filter.push(["==", "year", filters.year.value]);
      }
      // Aplica o filtro ao mapa.
      map.setFilter("cartas_25k_disponiveis", filter);
    }
  }

  // Adiciona um ouvinte de click para o botão de redefinir filtros
  // qdo o usuário clicar
  document
    .getElementById("reset-button")
    .addEventListener("click", () => applyFilter(true));

  // Adiciona ouvintes de evento para as mudanças nos filtros
  ["typeFilter", "ownerFilter", "scaleFilter", "yearFilter"].forEach((id) => {
    document
      .getElementById(id)
      .addEventListener("change", () => applyFilter(false));
  });

  // Função para ligar e desligar camadas do mapa
  // só deu para colocar o limite do país mas no html já tem para
  // estado e município
  document
    .getElementById("toggle-country")
    .addEventListener("change", function () {
      const isChecked = this.checked; // Verifica se a caixa de seleção está marcada.

      // Define a visibilidade da camada com base na seleção
      if (isChecked) {
        // documentção do setLayoutProperty https://docs.maptiler.com/sdk-js/api/map/#map#setlayoutproperty
        // não tem exemplo infelizmente
        map.setLayoutProperty("brazil_limits", "visibility", "visible"); // Torna a camada visível.
      } else {
        map.setLayoutProperty("brazil_limits", "visibility", "none"); // Torna a camada invisível.
      }
    });

  // Função para mostrar popups qdo clica na moldura
  // aqui cria uma nova instância de um popup
  let popup = new maptilersdk.Popup({
    closeButton: false, // define para não mostrar o botão de close
  });

  // captura o evento de clicar no mapa para abrir o popup
  // exemplo usado https://docs.maptiler.com/sdk-js/examples/polygon-popup-on-click/
  map.on("click", "cartas_25k_disponiveis", function (e) {
    // aqui pego o nome e o tipo do produto isso ven do geojson das molduras
    const itemName = `${e.features[0].properties.name} - ${e.features[0].properties.mi}`;
    const itemType = `${e.features[0].properties.type}`;

    // aqui configuro o popup para ser mostrado
    popup
      .setLngLat(e.lngLat)
      // aqui injeto o HTML de como quero que o popup seja
      .setHTML(
        `<div class="popup-container">
          <div class="popup-title">
              <h3>${e.features[0].properties.name}</h3>
              <h4>${e.features[0].properties.mi}</h4>
          </div>

          <div class="popup-content">
            <ul class="popup-list">
              <li>
                  <span class="legend-popup">Inom: ${e.features[0].properties.inom}</span>
              </li>
              <li>
                  <span class="legend-popup">Produtor: ${e.features[0].properties.owner}</span>
              </li>
              <li>
                  <span class="legend-popup">Tipo: ${e.features[0].properties.type}</span>
              </li>
              <li>
                  <span class="legend-popup">Escala: ${e.features[0].properties.scale}</span>
              </li>
              <li>
                  <span class="legend-popup">Data: ${e.features[0].properties.conclusion_date}</span>
              </li>
              </li>
              <li>
                  <span class="legend-popup">Ano: ${e.features[0].properties.year}</span>
              </li>
            </ul>
          </div>

          <div class="popup-footer">
            <button class="btn btn-sm" onclick="addToCart('${itemName}', '${itemType}')">
              <span id="add-shopping-cart" class="material-symbols-outlined">
                add_shopping_cart
              </span>
            </button>
          </div>
      </div>`
      )
      // adiciono o popup ao mapa
      .addTo(map);
  });

  // Cria uma instância do MapboxDraw para permitir o desenho de polígonos e a exclusão deles
  // exemplo https://docs.maptiler.com/sdk-js/examples/mapbox-gl-draw/
  var draw = new MapboxDraw({
    displayControlsDefault: false, // Não exibe os controles padrão do MapboxDraw
    controls: {
      polygon: true, // Habilita a ferramenta de desenho de polígonos
      trash: true, // Habilita a ferramenta para deletar feições desenhadas
    },
  });
  // adiciona a ferramenta de desenho ao mapa
  map.addControl(draw);

  // Corrige o estilo dos controles de desenho adicionando classes do MapLibre
  const drawControls = document.querySelectorAll(
    ".mapboxgl-ctrl-group.mapboxgl-ctrl"
  );
  drawControls.forEach((elem) => {
    elem.classList.add("maplibregl-ctrl", "maplibregl-ctrl-group");
  });

  // Altera o cursor ao passar o mouse sobre as feições
  map.on("mouseenter", "cartas_25k_disponiveis", function () {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "cartas_25k_disponiveis", function () {
    map.getCanvas().style.cursor = "";
  });

  // Evento que ocorre ao carregar o mapa
  // ao carregar o mapa em seguida carrega tb as duas camadas brazil(limite)
  // e geojson(molduras)
  // exemplo https://docs.maptiler.com/sdk-js/examples/geojson-polygon/
  map.on("load", async function () {
    const brazil = await maptilersdk.data.get(
      "e9eebc49-7c57-411f-8a04-c950d1b673c1"
    );
    // Adiciona a fonte de dados ao mapa
    map.addSource("brazil_2022", {
      type: "geojson",
      data: brazil,
    });
    // Adiciona uma camada que representa os limites do Brasil
    map.addLayer({
      id: "brazil_limits",
      type: "line",
      source: "brazil_2022",
      layout: {},
      paint: {
        "line-color": "rgb(0, 0, 0)",
        "line-width": 1,
        "line-dasharray": [2, 2],
      },
    });

    const geojson = await maptilersdk.data.get(
      "7188b22e-5d18-4516-8799-c3d6611bec43"
    );
    // Processa os dados de molduras para adicionar o ano, por causa daquele problema
    // com as datas
    geojson.features.forEach((feature) => {
      const dateParts = feature.properties.conclusion_date.split("/");
      feature.properties.year = dateParts[2];
    });
    // Adiciona a fonte de dados ao mapa
    map.addSource("molduras_25k", {
      type: "geojson",
      data: geojson,
    });
    // Adiciona uma camada que representa as cartas disponíveis
    map.addLayer({
      id: "cartas_25k_disponiveis",
      type: "fill",
      source: "molduras_25k",
      layout: {},
      paint: {
        "fill-color": "rgb(255, 255, 255)",
        "fill-opacity": 1,
        "fill-outline-color": "rgb(0, 0, 0)",
      },
    });
    // aqui crio uma variável com o bounding box do Brasil fiz na mão e coloquei aqui
    const extent = [
      [-73.990449969, -33.7511499081],
      [-34.793086643, 5.2718410768],
    ];
    // aqui aplica o zoom ao Brasil todo
    // doc https://docs.maptiler.com/sdk-js/api/map/#map#fitbounds
    // exemplo https://docs.maptiler.com/sdk-js/examples/fitbounds/
    map.fitBounds(extent, {
      padding: 20,
      duration: 1000,
    });
  });

  // Evento para exibir coordenadas quando o mouse se move sobre o mapa
  // exemplo https://docs.maptiler.com/sdk-js/examples/mouse-position/
  map.on("mousemove", function (e) {
    const lngLat = e.lngLat.wrap();
    // Formata as coordenadas para mostrar até 4 casas decimais de longitude e latitude
    const formattedLngLat = `Long: ${lngLat.lng.toFixed(
      4
    )}, Lat: ${lngLat.lat.toFixed(4)}`;
    // Atualiza o elemento HTML com ID 'latlong-info' no rodapé do site para exibir as coordenadas
    document.getElementById("latlong-info").innerHTML = formattedLngLat;
  });

  // Instancia um controle de geocodificação para buscar endereços e localizações no mapa
  // exemplo https://docs.maptiler.com/sdk-js/examples/geocoder-component/
  const gc = new maptilersdkMaptilerGeocoder.GeocodingControl({});
  document.getElementById("geocoding-control").appendChild(gc.onAdd(map));

  let isDrawing = false;
  // Cria um array para armazenar os polígonos que vão ser destacados
  const highlightedFeatures = [];

  map.on('draw.create', (e) => {

    isDrawing = true;

    const drawnPolygon = e.features[0];

    const geojsonData = map.getSource('molduras_25k')._data;

    geojsonData.features.forEach((feature) => {
        const intersection = turf.intersect(drawnPolygon, feature);

        if (intersection) {
            console.log('Interseção encontrada!', feature);

            // Adiciona cada polígono que intersecta ao array
            highlightedFeatures.push(feature);
        }
    });

    // Adiciona ou atualiza a camada para todos os polígonos destacados
    if (highlightedFeatures.length > 0) {
        if (map.getSource('highlighted-polygons')) {
            // Atualiza a fonte com os dados dos polígonos destacados
            map.getSource('highlighted-polygons').setData({
                type: 'FeatureCollection',
                features: highlightedFeatures
            });
        } else {
            // Adiciona a fonte se não existir
            map.addSource('highlighted-polygons', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: highlightedFeatures
                }
            });

            // Adiciona a camada para os polígonos destacados
            map.addLayer({
                id: 'highlighted-polygons',
                type: 'fill',
                source: 'highlighted-polygons',
                paint: {
                    'fill-color': '#FF0000', // Cor vermelha para destaque
                    'fill-opacity': 0.7
                }
            });
        }
    } else {
        // Se não houver interseções, remova a camada se existir
        if (map.getLayer('highlighted-polygons')) {
            map.removeLayer('highlighted-polygons');
            map.removeSource('highlighted-polygons');
        }
    }
  });

  map.on('draw.selectionchange', () => {

    function addToCart(items) {

      const badge = document.getElementById("badge");
      // Mostra o badge, que estava oculto
      badge.style.display = "inline-block";
      // Atualiza o número de itens no badge para o tamanho atual do carrinho
      badge.textContent = items.length;

      const cartItems = document.getElementById("cart-items");

      // Limpa o conteúdo atual do carrinho para evitar duplicações
      cartItems.innerHTML = "";

      // Itera sobre cada item do carrinho
      items.forEach((item) => {
        // Cria uma nova linha da tabela (tr) para cada item
        const cart_tr = document.createElement("tr");

        // Define o conteúdo HTML da nova linha do carrinho, com detalhes do item
        // cada linha é um produto(carta)
        cart_tr.innerHTML = `
          <td>
            <input type="checkbox" />
          </td>
          <td>
            <span>${item.properties.name}</span>
          </td>
          <td>
            <span>${item.properties.type}</span>
          </td>
          <td>
            <input type="number" value="${1}" /> 
          </td>
          <td>
            <span class="material-symbols-outlined icon-md-18">delete</span>
          </td>`;

        // Adiciona a nova linha à tabela de itens do carrinho
        cartItems.appendChild(cart_tr);
      });
    }

    if (isDrawing) {
        isDrawing = false; // Define que a criação foi concluída
        console.log('Desenho finalizado!');
        addToCart(highlightedFeatures);
    }
  });

  // Evento para deletar polígonos
  map.on('draw.delete', (e) => {
    if (map.getLayer('highlighted-polygons')) {
      map.removeLayer('highlighted-polygons');
      map.removeSource('highlighted-polygons');
    }
  });
  
});
