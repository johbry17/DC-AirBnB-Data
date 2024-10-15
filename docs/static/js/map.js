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

  // initial call for controls, infoBox, and plots
  neighborhoodsControl(map, neighborhoods, listingsData, priceAvailabilityData);

  // event listeners for resizing
  window.addEventListener("resize", () => {
    map.invalidateSize();
    resizePlots();
  });

  // resize map to ensure it loads correctly
  map.invalidateSize();

  const neighborhoodsLayer = initializeNeighborhoodsLayer(neighborhoods);
  const averagePrices = calculateAveragePricePerNeighborhood(listingsData);
  const choroplethLayer = initializeChoroplethLayer(
    neighborhoods,
    averagePrices
  );

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
    .addEventListener("click", function (e) {
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
    });
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
  const defaultMarkers = createMarkers(listingsData);
  const licenseMarkers = createMarkers(listingsData, "license");
  const propertyTypeMarkers = createMarkers(listingsData, "propertyType");

  return {
    default: defaultMarkers,
    license: licenseMarkers,
    propertyType: propertyTypeMarkers,
  };
}

// initialize overlays
function initializeOverlays(markerGroups, neighborhoods, listingsData) {
  const averagePrices = calculateAveragePricePerNeighborhood(listingsData);
  const choroplethLayer = initializeChoroplethLayer(
    neighborhoods,
    averagePrices
  );
  const bubbleLayer = initializeBubbleChartLayer(neighborhoods, listingsData);

  return {
    "Airbnb's": markerGroups.default,
    "License Status": markerGroups.license,
    "Property Type": markerGroups.propertyType,
    "Average Price": choroplethLayer,
    "Total Airbnbs": bubbleLayer,
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
  const getColor = (price) => {
    const colorScale = d3
      .scaleSequential(d3.interpolateViridis)
      .domain([50, 300]);

    return colorScale(price);
  };

  return L.geoJSON(neighborhoods, {
    style: (feature) => {
      const neighborhood = feature.properties.neighbourhood;
      const avgPrice = averagePrices[neighborhood] || 0;
      return {
        fillColor: getColor(avgPrice),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 1,
      };
    },
    onEachFeature: (feature, layer) => {
      const neighborhood = feature.properties.neighbourhood;
      const avgPrice = averagePrices[neighborhood] || "No Data";
      const popupContent = `${neighborhood}<br><strong style='display: block; text-align: right;'>Average Price: $${avgPrice.toFixed(
        2
      )}</strong>`;

      // bind popup to the layer
      layer.bindPopup(popupContent, { className: "marker-popup" });

      // open || close popup
      layer.on("mouseover", function (e) {
        this.openPopup();
      });
      layer.on("mouseout", function (e) {
        this.closePopup();
      });

      // for touch events on mobile devices
      layer.on("click", function (e) {
        if (this.isPopupOpen()) {
          this.closePopup();
        } else {
          this.openPopup();
        }
      });
    },
  });
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

    // create a divIcon to show the text inside the bubble
    const textIcon = L.divIcon({
      className: "bubble-text", // define custom CSS class for styling
      html: `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;  font-size: 12px; color: white;">${count}</div>`,
      iconSize: [radius * 2, radius * 2], // match the size of the circle marker
      iconAnchor: [radius, radius], // center the text inside the bubble
    });

    // create marker with the text inside and add it to the layer
    const textMarker = L.marker(latlng, { icon: textIcon, interactive: false });

    // add circle marker to layer group
    bubbleLayerGroup.addLayer(circleMarker);
    bubbleLayerGroup.addLayer(textMarker);

    // open || close popup
    circleMarker.on("mouseover", function (e) {
      this.openPopup();
    });
    circleMarker.on("mouseout", function (e) {
      this.closePopup();
    });

    // for touch events on mobile devices
    circleMarker.on("click", function (e) {
      if (this.isPopupOpen()) {
        this.closePopup();
      } else {
        this.openPopup();
      }
    });
  });

  return bubbleLayerGroup;
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
    if (activeOverlay) {
      map.removeLayer(activeOverlay);
    }
    if (activeLegend) {
      map.removeControl(activeLegend);
    }

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
  if (activeOverlay) {
    map.removeLayer(activeOverlay);
  }
  if (activeLegend) {
    map.removeControl(activeLegend);
  }

  //update overlays
  // check if "Average Price" is selected
  if (selectedOverlayName === "Average Price") {
    // add choropleth layer
    map.addLayer(choroplethLayer);
    activeOverlay = choroplethLayer;
    activeLegend = addLegend("Average Price").addTo(map);
  } else if (selectedOverlayName === "Total Airbnbs") {
    map.eachLayer((layer) => {
      if (layer !== baseLayer) {
        map.removeLayer(layer);
      }
    });
    // add bubble chart layer
    const bubbleLayer = initializeBubbleChartLayer(neighborhoods, listingsData);
    map.addLayer(bubbleLayer);
    activeOverlay = bubbleLayer;
  } else {
    // or update overlays with markers
    if (overlays[selectedOverlayName]) {
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
    } else {
      console.error(`Overlay "${selectedOverlayName}" is not defined.`);
    }
  }
}

// create legend
function addLegend(type) {
  let legend = L.control({
    position: "topright",
  });

  // format legend based on type
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "custom-legend");
    div.style.zIndex = "1000"; // ensure legend is on top

    // conditional to set labels and colors
    let labels, colors;
    if (type === "License Status") {
      labels = ["Licensed", "Exempt", "No License"];
      colors = labels.map(
        (label) => licenseColors[label] || licenseColors.default
      );
      div.innerHTML = '<div class="legend-title">License Status</div>';
    } else if (type === "Property Type") {
      labels = ["Entire home/apt", "Private room", "Shared room", "Hotel room"];
      colors = labels.map(
        (label) => propertyTypeColors[label] || propertyTypeColors.default
      );
      div.innerHTML = '<div class="legend-title">Property Type</div>';
    } else if (type === "Average Price") {
      div.innerHTML = '<div class="legend-title">Average Price</div>';

      // create gradient bar
      const gradientBar = document.createElement("div");
      gradientBar.style.width = "100%";
      gradientBar.style.height = "20px";
      gradientBar.style.background =
        "linear-gradient(to right, " +
        Array.from({ length: 101 }, (_, i) =>
          d3.scaleSequential(d3.interpolateViridis).domain([50, 300])(
            50 + i * 2.5
          )
        ).join(", ") +
        ")";
      div.appendChild(gradientBar);

      // add labels
      const labelContainer = document.createElement("div");
      labelContainer.style.display = "flex";
      labelContainer.style.justifyContent = "space-between";
      const labelStart = document.createElement("div");
      labelStart.innerHTML = "$50";
      const labelEnd = document.createElement("div");
      labelEnd.innerHTML = "$300";
      labelContainer.appendChild(labelStart);
      labelContainer.appendChild(labelEnd);
      div.appendChild(labelContainer);
    }

    // populate the legend if not "Average Price"
    if (type !== "Average Price") {
      labels.forEach(function (label, index) {
        div.innerHTML += `<div><i class="legend-color" style="background:${colors[index]}"></i>${label}</div>`;
      });
    }

    return div;
  };

  return legend;
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
  controlDiv.innerHTML = `<div class="control-header">
    <label for="neighborhoods-dropdown">Select a Neighborhood</label>
    <br>
  </div>`;
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

  // populate dropdown menu
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
    let popupOpen = false; // boolean to track if a popup is open
    marker.on("mouseover", () => marker.openPopup());
    marker.on("mouseout", () => {
      if (!popupOpen) marker.closePopup();
    });
    marker.on("click", () => {
      popupOpen = !popupOpen;
    });

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
    // if (activeLegend.options.position === "topright") {
    if (activeLegend._container.innerHTML.includes("License Status")) {
      return "license";
    } else if (activeLegend._container.innerHTML.includes("Property Type")) {
      return "propertyType";
    }
    // }
  }
  return null;
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

  // set color scheme
  const colorScheme = getColorScheme();

  // update markers, infoBox, and plots
  createMarkers(listingsData, colorScheme).addTo(map);
  updateInfoBox(listingsData, "Washington, D.C.");
  allDCPlots(listingsData, priceAvailabilityData, defaultColors);

  // toggle average price button
  const averagePriceButton = document.getElementById("average-price-button");
  if (averagePriceButton) {
    averagePriceButton.disabled = false; // enable button
    // averagePriceButton.style.display = 'block'; // show button
  }
  const totalAirbnbsButton = document.getElementById("total-airbnbs-button");
  if (totalAirbnbsButton) {
    totalAirbnbsButton.disabled = false; // enable button
    // totalAirbnbsButton.style.display = 'block'; // show button
  }
}

// zooms map for neighborhood view, updates infoBox and plots
function zoomIn(
  map,
  neighborhoodsLayer,
  selectedNeighborhood,
  listingsData,
  priceAvailabilityData
) {
  // toggle average price button and choropleth legend
  const averagePriceButton = document.getElementById("average-price-button");
  if (averagePriceButton) {
    averagePriceButton.disabled = true; // disable button
    // averagePriceButton.style.display = 'none'; // hide button
  }
  if (
    activeLegend &&
    activeLegend._container.innerHTML.includes("Average Price")
  ) {
    activeLegend._container.style.display = "none";
  }
  // toggle total airbnbs button
  const totalAirbnbsButton = document.getElementById("total-airbnbs-button");
  if (totalAirbnbsButton) {
    totalAirbnbsButton.disabled = true; // disnable button
    // totalAirbnbsButton.style.display = 'block'; // hide button
  }

  // remove previous neighborhood boundaries
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
    // neighborhoodsLayer.addTo(map);

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

    // set color scheme
    const colorScheme = getColorScheme();

    // add new markers
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
