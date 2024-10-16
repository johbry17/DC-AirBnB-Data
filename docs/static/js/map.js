// Description: This file contains the functions to create the map, markers, overlays, and controls

// global variables
let activeOverlay = null;
let activeLegend = null;
let baseLayer = null;

// map creation
function createMap(neighborhoods, listingsData, priceAvailabilityData) {
  const map = initializeMap();
  const markerGroups = initializeMarkerGroups(listingsData);
  const overlays = initializeOverlays(
    markerGroups,
    neighborhoods,
    listingsData
  );

  addBaseLayerControl(map);

  // initial call for controls, infoBox, plots, neighborhood and choropleth layers
  neighborhoodsControl(map, neighborhoods, listingsData, priceAvailabilityData);
  // initializeNeighborhoodsLayer(neighborhoods); // added by neighborhoodsControl
  const averagePrices = calculateAveragePricePerNeighborhood(listingsData);
  const choroplethLayer = initializeChoroplethLayer(
    neighborhoods,
    averagePrices
  );

  // event listeners for resizing
  window.addEventListener("resize", () => {
    map.invalidateSize();
    resizePlots();
  });

  // resize map to ensure it loads correctly
  map.invalidateSize();

  // sync dropdown and overlays with initial values
  syncDropdownAndOverlay(
    map,
    "top",
    "Airbnb's",
    overlays,
    listingsData,
    priceAvailabilityData,
    neighborhoods,
    choroplethLayer
  );

  // event listener for overlay changes
  document
    .getElementById("overlay-control")
    .addEventListener("click", handleOverlayClick);

  // change overlay based on click
  function handleOverlayClick(e) {
    const selectedOverlay = e.target.getAttribute("data-overlay");
    if (selectedOverlay && overlays[selectedOverlay]) {
      syncDropdownAndOverlay(
        map,
        document.getElementById("neighborhoods-dropdown").value,
        selectedOverlay,
        overlays,
        listingsData,
        priceAvailabilityData,
        neighborhoods,
        choroplethLayer
      );
    }
  }
}

// initialize the map
function initializeMap() {
  baseLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );
  return L.map("map-id", {
    center: [38.89511, -77.03637],
    zoom: 12,
    layers: [baseLayer],
  });
}

// initialize marker groups
function initializeMarkerGroups(listingsData) {
  return {
    default: createMarkers(listingsData),
    license: createMarkers(listingsData, "license"),
    propertyType: createMarkers(listingsData, "propertyType"),
  };
}

// initialize overlays
function initializeOverlays(markerGroups, neighborhoods, listingsData) {
  const averagePrices = calculateAveragePricePerNeighborhood(listingsData);
  return {
    "Airbnb's": markerGroups.default,
    "License Status": markerGroups.license,
    "Property Type": markerGroups.propertyType,
    "Average Price": initializeChoroplethLayer(neighborhoods, averagePrices),
    "Total Airbnbs": initializeBubbleChartLayer(neighborhoods, listingsData),
  };
}

// add the base layers and control
function addBaseLayerControl(map) {
  let baseMap = {
    "Street Map": L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ),
    Satellite: L.esri.basemapLayer("Imagery"),
    "National Geographic": L.esri.basemapLayer("NationalGeographic"),
    Topographic: L.esri.basemapLayer("Topographic"),
    Grayscale: L.esri.basemapLayer("Gray"),
  };
  L.control.layers(baseMap, null).addTo(map);
}

// initialize neighborhoods layer and zoomIn function to neighborhoods
function initializeNeighborhoodsLayer(
  map,
  neighborhoods,
  listingsData,
  priceAvailabilityData
) {
  const neighborhoodsLayer = L.geoJSON(neighborhoods, {
    style: {
      color: defaultColors.neighborhoodLayer,
      weight: 3,
    },
    // update dropdown and zoom in on neighborhood
    onEachFeature: (feature, layer) => {
      layer.on("click", function () {
        const selectedNeighborhood = feature.properties.neighbourhood;
        document.getElementById("neighborhoods-dropdown").value =
          selectedNeighborhood;
        zoomIn(
          map,
          neighborhoodsLayer,
          selectedNeighborhood,
          listingsData,
          priceAvailabilityData
        );
      });
    },
  });

  // return the layer without adding it to the map
  return neighborhoodsLayer;
}

// create choropleth layer for neighborhood boundaries
function initializeChoroplethLayer(neighborhoods, averagePrices) {
  const getColor = (price) =>
    d3.scaleSequential(d3.interpolateViridis).domain([50, 300])(price);

  // to hold the choropleth and text markers
  const layerGroup = L.layerGroup();

  // layer for the choropleth polygons
  const choroplethLayer = L.geoJSON(neighborhoods, {
    style: (feature) => ({
      // const neighborhood = feature.properties.neighbourhood;
      // const avgPrice = averagePrices[neighborhood] || 0;
      // return {
      fillColor: getColor(averagePrices[feature.properties.neighbourhood] || 0),
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 1,
      // };
    }),
    onEachFeature: setChoroplethFeatures(averagePrices, layerGroup),
  });

  // add choropleth to layer
  layerGroup.addLayer(choroplethLayer);

  return layerGroup;
}

// set features for choropleth layer
function setChoroplethFeatures(averagePrices, layerGroup) {
  return (feature, layer) => {
    const neighborhood = feature.properties.neighbourhood;
    const avgPrice = averagePrices[neighborhood] || "No Data";
    const popupContent = `${neighborhood}<br><strong style='display: block; text-align: right;'>Average Price: $${avgPrice.toFixed(
      2
    )}</strong>`;

    // bind popup to layer
    layer.bindPopup(popupContent, { className: "marker-popup" });

    // open || close popup
    popupMouseEvents(layer);

    // calculate centroid
    const centroid = turf.centroid(feature);
    const latlng = [
      centroid.geometry.coordinates[1],
      centroid.geometry.coordinates[0],
    ];

    // add create text marker and add to layer
    const textMarker = L.marker(latlng, {
      icon: L.divIcon({
        className: "custom-label",
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;  font-size: 12px; color: black;"><b>$${avgPrice.toFixed(
          0
        )}</b></div>`,
        iconSize: [100, 50],
        iconAnchor: [50, 25], // anchor point of the text box
      }),
      interactive: false,
    });

    layerGroup.addLayer(textMarker);
  };
}

// create bubble chart layer of airbnb's per neighborhood
function initializeBubbleChartLayer(neighborhoods, listingsData) {
  const neighborhoodData = calculateAirbnbCountsPerNeighborhood(listingsData);
  const bubbleLayerGroup = L.layerGroup(); // create layer group for circle markers

  neighborhoods.features.forEach((feature) => {
    const neighborhood = feature.properties.neighbourhood;
    const count = neighborhoodData[neighborhood] || 0;
    const radius = Math.sqrt(count) * 2;

    // calculate centroid
    const centroid = turf.centroid(feature);
    const latlng = [
      centroid.geometry.coordinates[1],
      centroid.geometry.coordinates[0],
    ];

    // create circle marker at centroid
    const circleMarker = L.circleMarker(latlng, {
      radius: radius,
      fillColor: defaultColors.neighborhoodColor,
      color: "black",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    }).bindPopup(
      `${neighborhood}<br><strong style='display: block; text-align: right;'>Airbnb Count: ${count}</strong>`,
      { className: "marker-popup" }
    );

    // create marker with text inside and add to layer
    const textMarker = L.marker(latlng, {
      icon: L.divIcon({
        className: "bubble-text",
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;  font-size: 12px; color: white;">${count}</div>`,
        iconSize: [radius * 2, radius * 2], // match size of circle marker
        iconAnchor: [radius, radius], // center text
      }),
      interactive: false,
    });

    // open || close popup
    popupMouseEvents(circleMarker);

    // add markers to layer group
    bubbleLayerGroup.addLayer(circleMarker).addLayer(textMarker);
  });

  return bubbleLayerGroup;
}

// handle popup events
function popupMouseEvents(layer) {
  let popupOpen = false; // tracks popup state

  layer.on({
    mouseover() {
      if (!popupOpen) this.openPopup();
    },
    mouseout() {
      if (!popupOpen) this.closePopup();
    },
    click() {
      popupOpen ? this.closePopup() : this.openPopup();
      popupOpen = !popupOpen;
    },
  });
}

// update the overlay
function updateOverlay(
  map,
  newOverlay,
  overlayName,
  listingsData,
  selectedNeighborhood
) {
  // remove previous overlay
  if (activeOverlay !== newOverlay) {
    removeOverlays(map);

    // filter listings by neighborhood
    const filteredListings = filterListingsByNeighborhood(
      listingsData,
      selectedNeighborhood
    );

    // set active overlay and legend
    let updatedMarkers;
    if (overlayName === "License Status") {
      updatedMarkers = createMarkers(filteredListings, "license");
      activeLegend = addLegend("License Status").addTo(map);
    } else if (overlayName === "Property Type") {
      updatedMarkers = createMarkers(filteredListings, "propertyType");
      activeLegend = addLegend("Property Type").addTo(map);
    } else {
      updatedMarkers = createMarkers(filteredListings);
      activeLegend = null;
    }

    // add new overlay
    map.addLayer(updatedMarkers);
    activeOverlay = updatedMarkers;
  }

  return { activeOverlay, activeLegend };
}

// sync dropdown and overlays
function syncDropdownAndOverlay(
  map,
  selectedNeighborhood,
  selectedOverlayName,
  overlays,
  listingsData,
  priceAvailabilityData,
  neighborhoods,
  choroplethLayer
) {
  // remove all existing markers
  removeOverlays(map);

  // update overlays
  // choropleth layer
  if (selectedOverlayName === "Average Price") {
    activateOverlay(map, choroplethLayer);
    activeLegend = addLegend("Average Price").addTo(map);
    // bubble chart layer
  } else if (selectedOverlayName === "Total Airbnbs") {
    map.eachLayer((layer) => {
      if (layer !== baseLayer) {
        map.removeLayer(layer);
      }
    });
    const bubbleLayer = initializeBubbleChartLayer(neighborhoods, listingsData);
    activateOverlay(map, bubbleLayer);
    // marker overlays
  } else {
    activateMarkerOverlay(
      map,
      selectedOverlayName,
      overlays,
      listingsData,
      selectedNeighborhood,
      priceAvailabilityData
    );
  }
}

// remove overlay from map
function removeOverlays(map) {
  if (activeOverlay) {
    map.removeLayer(activeOverlay);
  }
  if (activeLegend) {
    map.removeControl(activeLegend);
  }
}

// add overlay to map
function activateOverlay(map, overlay) {
  map.addLayer(overlay);
  activeOverlay = overlay;
}

// add marker overlay to map
function activateMarkerOverlay(
  map,
  selectedOverlayName,
  overlays,
  listingsData,
  selectedNeighborhood,
  priceAvailabilityData
) {
  const overlayState = updateOverlay(
    map,
    overlays[selectedOverlayName],
    selectedOverlayName,
    listingsData,
    selectedNeighborhood
  );
  activeOverlay = overlayState.activeOverlay;
  activeLegend = overlayState.activeLegend;
  // update plots and reset map view
  if (selectedNeighborhood === "top") {
    resetMapView(map, activeOverlay, listingsData, priceAvailabilityData);
  } else {
    zoomIn(
      map,
      activeOverlay,
      selectedNeighborhood,
      listingsData,
      priceAvailabilityData
    );
  }
}

// create legend
function addLegend(type) {
  let legend = L.control({ position: "topright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "custom-legend");
    div.style.zIndex = "1000"; // ensure legend is on top

    // set labels and colors based on type
    let labels = [],
      colors = [];
    switch (type) {
      case "License Status":
        labels = ["Licensed", "Exempt", "No License"];
        colors = labels.map(
          (label) => licenseColors[label] || licenseColors.default
        );
        div.innerHTML = '<div class="legend-title">License Status</div>';
        break;
      case "Property Type":
        labels = [
          "Entire home/apt",
          "Private room",
          "Shared room",
          "Hotel room",
        ];
        colors = labels.map(
          (label) => propertyTypeColors[label] || propertyTypeColors.default
        );
        div.innerHTML = '<div class="legend-title">Property Type</div>';
        break;
      case "Average Price":
        div.innerHTML = '<div class="legend-title">Average Price</div>';
        const gradientBar = createGradientBar();
        div.appendChild(gradientBar);
        div.appendChild(createPriceLabels());
        return div;
    }

    // Append the legend colors and labels
    labels.forEach((label, index) => {
      div.innerHTML += `<div><i class="legend-color" style="background:${colors[index]}"></i><strong>${label}</strong></div>`;
    });

    return div;
  };

  return legend;
}

// create gradient bar for choropleth legend
function createGradientBar() {
  const gradientBar = document.createElement("div");
  gradientBar.style.width = "100%";
  gradientBar.style.height = "20px";
  gradientBar.style.background = `linear-gradient(to right, ${Array.from(
    { length: 101 },
    (_, i) =>
      d3.scaleSequential(d3.interpolateViridis).domain([50, 300])(50 + i * 2.5)
  ).join(", ")})`;
  return gradientBar;
}

// create labels for choropleth legend price range
function createPriceLabels() {
  const labelContainer = document.createElement("div");
  labelContainer.style.display = "flex";
  labelContainer.style.justifyContent = "space-between";
  labelContainer.innerHTML = `<div>$50</div><div>$300</div>`;
  return labelContainer;
}

// create dropdown for neighborhood interaction
function neighborhoodsControl(
  map,
  neighborhoodsInfo,
  listingsData,
  priceAvailabilityData
) {
  const controlDiv = document.getElementById("neighborhoods-control");
  const dropdown = createNeighborhoodDropdown(neighborhoodsInfo);
  controlDiv.appendChild(dropdown);

  // create neighborhoods layer but don't add it to the map yet
  const neighborhoodsLayer = initializeNeighborhoodsLayer(
    map,
    neighborhoodsInfo,
    listingsData,
    priceAvailabilityData
  );

  // add event listener for dropdown changes
  addDropdownChangeListener(
    dropdown,
    map,
    neighborhoodsLayer,
    listingsData,
    priceAvailabilityData
  );
}

// create neighborhood dropdown elements
function createNeighborhoodDropdown(neighborhoodsInfo) {
  const dropdown = document.createElement("select");
  dropdown.id = "neighborhoods-dropdown";

  // sort neighborhoods alphabetically
  neighborhoodsInfo.features.sort((a, b) =>
    a.properties.neighbourhood.localeCompare(b.properties.neighbourhood)
  );

  // populate dropdown menu, DC first, then sorted neighborhoods
  const allDC = createOption("Washington, D.C.", "top");
  dropdown.appendChild(allDC);
  neighborhoodsInfo.features.forEach((feature) => {
    const option = createOption(
      feature.properties.neighbourhood,
      feature.properties.neighbourhood
    );
    dropdown.appendChild(option);
  });

  return dropdown;
}

// event listener for dropdown changes
function addDropdownChangeListener(
  dropdown,
  map,
  neighborhoodsLayer,
  listingsData,
  priceAvailabilityData
) {
  dropdown.addEventListener("change", function () {
    const selectedNeighborhood = this.value;
    if (selectedNeighborhood === "top") {
      resetMapView(
        map,
        neighborhoodsLayer,
        listingsData,
        priceAvailabilityData
      );
    } else {
      zoomIn(
        map,
        neighborhoodsLayer,
        selectedNeighborhood,
        listingsData,
        priceAvailabilityData
      );
    }
  });
}

// create dropdown options
function createOption(text, value) {
  const option = document.createElement("option");
  option.text = text;
  option.value = value;
  return option;
}

// initialize markers with custom color options based on a property
function createMarkers(data, colorScheme = null) {
  // process data for license status
  data = setLicenseStatus(data);

  // empty marker layer
  const markers = L.layerGroup();

  // loop to populate markers
  data.forEach((listing) => {
    let markerColor = defaultColors.airbnbs; // default color

    // determine marker color based on colorScheme parameter
    if (colorScheme === "license") {
      markerColor =
        licenseColors[listing.licenseCategory] || licenseColors.default;
    } else if (colorScheme === "propertyType") {
      markerColor =
        propertyTypeColors[listing.room_type] || propertyTypeColors.default;
    }

    // marker design
    const markerOptions = {
      radius: 3,
      fillColor: markerColor,
      color: "black",
      weight: 1,
      fillOpacity: 1,
      interactive: true,
    };

    const marker = L.circleMarker(
      [listing.latitude, listing.longitude],
      markerOptions
    );
    marker.bindPopup(createPopupContent(listing), {
      className: "marker-popup",
    });

    // open || close popup
    popupMouseEvents(marker);

    // bring marker to front on hover
    marker.bringToFront();

    markers.addLayer(marker);
  });

  return markers;
}

// populate popups
function createPopupContent(listing) {
  const price = parseFloat(listing.price).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const hostVerified =
    listing.host_identity_verified === "True" ? "Verified" : "Unverified";
  const hoverDescription = listing.hover_description
    ? `<h4><b>${listing.hover_description}</b></h4>`
    : "<h4><b>Description not available</b></h4>";
  const rating = listing.review_scores_rating
    ? `${listing.review_scores_rating} \u2605`
    : "No rating yet";
  const license = listing.license
    ? listing.license.split(":")[0].trim()
    : "No License";

  return `
    ${hoverDescription}
    <a href="${listing.listing_url}" target="_blank">Link to listing</a><br>
    <b>Price:</b> ${price}<br>
    <b>Property Type:</b> ${listing.room_type}<br>
    <b>Property Subtype:</b> ${listing.property_type}<br>
    <b>Accommodates:</b> ${listing.accommodates}<br>
    <b>Rating:</b> ${rating}<br>
    <b>Host:</b> ${listing.host_name}<br>
    <b>Host Verified:</b> ${hostVerified}<br>
    <b>Host Total Airbnbs:</b> ${listing.host_listings_count}<br>
    <b>License:</b> ${license}<br>
  `;
}

// get color scheme for markers when changing map view / zoom level
function getColorScheme() {
  if (activeLegend) {
    if (activeLegend._container.innerHTML.includes("License Status")) {
      return "license";
    } else if (activeLegend._container.innerHTML.includes("Property Type")) {
      return "propertyType";
    }
    // }
  }
  return null;
}

// enable || disable buttons
function toggleButton(buttonId, enable = true) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = !enable;
    // button.style.display = enable ? 'block' : 'none'; // use if visibility needs changing
  }
}

// resets map view to all of D.C., updates infoBox and plots
function resetMapView(
  map,
  neighborhoodsLayer,
  listingsData,
  priceAvailabilityData
) {
  map.setView([38.89511, -77.03637], 12);
  map.removeLayer(neighborhoodsLayer); // remove neighborhood boundaries from zoomIn()

  // update markers with appropriate color scheme, infoBox, and plots
  const colorScheme = getColorScheme();
  createMarkers(listingsData, colorScheme).addTo(map);
  updateInfoBox(listingsData, "Washington, D.C.");
  allDCPlots(listingsData, priceAvailabilityData, defaultColors);

  // toggle average price button
  toggleButton("average-price-button", true);
  toggleButton("total-airbnbs-button", true);
}

// zooms map for neighborhood view, updates infoBox and plots
function zoomIn(
  map,
  neighborhoodsLayer,
  selectedNeighborhood,
  listingsData,
  priceAvailabilityData
) {
  // toggle buttons and choropleth legend
  toggleButton("total-airbnbs-button", false);
  toggleButton("average-price-button", false);
  if (
    activeLegend &&
    activeLegend._container.innerHTML.includes("Average Price")
  ) {
    activeLegend._container.style.display = "none";
  }

  // remove previous neighborhood boundaries (or they will remain uncovered)
  neighborhoodsLayer.resetStyle();

  // get neighborhood boundaries
  const boundaries = neighborhoodsLayer
    .getLayers()
    .find(
      (layer) => layer.feature.properties.neighbourhood === selectedNeighborhood
    );

  // update map view
  if (boundaries) {
    boundaries.setStyle({ weight: 3, color: "transparent" });
    map.fitBounds(boundaries.getBounds());

    // filter listings by neighbourhood
    const filteredListings = filterListingsByNeighborhood(
      listingsData,
      selectedNeighborhood
    );

    // clear markers
    map.eachLayer((layer) => {
      if (layer instanceof L.LayerGroup) {
        map.removeLayer(layer);
      }
    });

    // add layers
    neighborhoodsLayer.addTo(map);

    // add new markers
    const colorScheme = getColorScheme();
    createMarkers(filteredListings, colorScheme).addTo(map);

    // update infoBox, and plots
    updateInfoBox(listingsData, selectedNeighborhood);
    neighborhoodPlots(
      listingsData,
      selectedNeighborhood,
      priceAvailabilityData,
      defaultColors
    );
  }
}
