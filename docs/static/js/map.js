// global variables
let activeOverlay = null;
let activeLegend = null;

// map creation
function createMap(neighborhoods, listingsData, priceAvailabilityData) {
  const map = initializeMap();
  const markerGroups = initializeMarkerGroups(listingsData);
  const overlays = initializeOverlays(markerGroups);

  // let activeOverlay = markerGroups.default; // default overlay

  addBaseLayerControl(map);
  // addOverlayControl(map, overlays);

  // initial call for controls, infoBox, and plots
  neighborhoodsControl(map, neighborhoods, listingsData, priceAvailabilityData);
  // updateInfoBox(listingsData, "Washington, D.C.");
  // allDCPlots(listingsData, priceAvailabilityData, defaultColors);

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
    priceAvailabilityData
  );

  // event listener for dropdown and overlay changes
  document.getElementById("overlay-control").addEventListener("click", function (e) {
    const selectedOverlay = e.target.getAttribute("data-overlay");
    if (selectedOverlay && overlays[selectedOverlay]) {
      syncDropdownAndOverlay(
        map,
        document.getElementById("neighborhoods-dropdown").value,
        selectedOverlay,
        overlays,
        listingsData,
        priceAvailabilityData
      );
    }
  });
}

// initialize the map
function initializeMap() {
  let baseLayer = L.tileLayer(
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
function initializeOverlays(markerGroups) {
  return {
    "Airbnb's": markerGroups.default,
    "License Status": markerGroups.license,
    "Property Type": markerGroups.propertyType,
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

// update the overlay
function updateOverlay(map, newOverlay, overlayName, listingsData, selectedNeighborhood) {
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
      updatedMarkers = createMarkers(filteredListings); // default markers
      activeLegend = null;
    }

    // add new overlay
    map.addLayer(updatedMarkers);
    activeOverlay = updatedMarkers; 
  }

  return { activeOverlay, activeLegend };
}

// initialize neighborhoods layer and add event listener to neighborhoods
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

// sync dropdown and overlays
function syncDropdownAndOverlay(
  map,
  selectedNeighborhood,
  selectedOverlayName,
  overlays,
  listingsData,
  priceAvailabilityData
) {
  // const dropdown = document.getElementById("neighborhoods-dropdown");
  // dropdown.value = selectedNeighborhood;

  // update overlay
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
  } else {
    console.error(`Overlay "${selectedOverlayName}" is not defined.`);
  }

  // update plots
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
      colors = labels.map(label => licenseColors[label] || licenseColors.default);
      div.innerHTML = '<div class="legend-title">License Status</div>';
    } else if (type === "Property Type") {
      labels = ["Entire home/apt", "Private room", "Shared room", "Hotel room"];
      colors = labels.map(label => propertyTypeColors[label] || propertyTypeColors.default);
      div.innerHTML = '<div class="legend-title">Property Type</div>';
    }

    // populate the legend
    labels.forEach(function (label, index) {
      div.innerHTML += `<div><i class="legend-color" style="background:${colors[index]}"></i>${label}</div>`;
    });

    return div;
  };

  return legend;
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
    <b>Host Total Listings:</b> ${listing.host_listings_count}<br>
    <b>License:</b> ${license}<br>
  `;
}

// get color scheme for markers when changing map view / zoom level
function getColorScheme() {
  if (activeLegend) {
    if (activeLegend.options.position === "topright") {
      if (activeLegend._container.innerHTML.includes("License Status")) {
        return "license";
      } else if (activeLegend._container.innerHTML.includes("Property Type")) {
        return "propertyType";
      }
    }
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
}

// zooms map for neighborhood view, updates infoBox and plots
function zoomIn(
  map,
  neighborhoodsLayer,
  selectedNeighborhood,
  listingsData,
  priceAvailabilityData
) {
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
