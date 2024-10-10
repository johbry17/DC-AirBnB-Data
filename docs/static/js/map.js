// map creation
function createMap(neighborhoods, listingsData, priceAvailabilityData) {
  // create base layer
  let baseLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );

  // create objects to hold the base maps...
  let baseMap = {
    "Street Map": baseLayer,
    Satellite: L.esri.basemapLayer("Imagery"),
    "National Geographic": L.esri.basemapLayer("NationalGeographic"),
    Topographic: L.esri.basemapLayer("Topographic"),
    Grayscale: L.esri.basemapLayer("Gray"),
  };

  // different marker layers
  const defaultMarkers = createMarkers(listingsData);
  const licenseMarkers = createMarkers(listingsData, "license");
  const propertyTypeMarkers = createMarkers(listingsData, "propertyType");

  // initialize marker groups
  const markerGroups = {
    default: defaultMarkers,
    license: licenseMarkers,
    propertyType: propertyTypeMarkers,
  };

  // add marker overlays for toggling
  const overlays = {
    "Airbnb's": markerGroups.default,
    "License Status": markerGroups.license,
    "Property Type": markerGroups.propertyType,
  };

  // initialize map
  const map = L.map("map-id", {
    center: [38.89511, -77.03637],
    zoom: 12,
    layers: [baseLayer, markerGroups.default],
  });

  // create toggle for map layers
  L.control.layers(baseMap, overlays).addTo(map);
  // L.control.layers(baseMap, overlays,
  // { collapsed: false }
  // )
  // .addTo(map);

  let activeOverlay = markerGroups.default;
  let activeLegend = null;

  // event listeners for overlay add/remove
  map.on("overlayadd", function (eventLayer) {
    const selectedOverlay = overlays[eventLayer.name];
    if (activeOverlay !== selectedOverlay) {
      // Remove the current legend if it exists
      if (activeLegend) {
        map.removeControl(activeLegend);
      }

      // Add the new legend
      if (eventLayer.name === "License Status") {
        activeLegend = addLegend("License Status").addTo(map);
      } else if (eventLayer.name === "Property Type") {
        activeLegend = addLegend("Property Type").addTo(map);
      }

      // bring markers to front
      selectedOverlay.eachLayer((layer) => {
        if (layer.bringToFront) {
          layer.bringToFront();
        }
      });

      activeOverlay = selectedOverlay;
    }
  });

  map.on("overlayremove", function (eventLayer) {
    if (
      (eventLayer.name === "License Status" &&
        activeOverlay === markerGroups.license) ||
      (eventLayer.name === "Property Type" &&
        activeOverlay === markerGroups.propertyType)
    ) {
      if (activeLegend) {
        map.removeControl(activeLegend);
        activeLegend = null;
        activeOverlay = null;
      }
    }

    // activeOverlay = null;
  });

  // initialize neighborhoodLayer
  const neighborhoodsLayer = L.geoJSON(neighborhoods, {
    style: {
      // opacity: 0,
      color: defaultColors.neighborhoodLayer,
      weight: 3,
    },
    // event listener, zooms into neighborhood on click
    onEachFeature: (feature, layer) => {
      layer.on("click", function () {
        const selectedNeighborhood = feature.properties.neighbourhood;

        // update dropdown to selected neighborhood
        const dropdown = document.getElementById("neighborhoods-dropdown");
        dropdown.value = selectedNeighborhood;

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

  // initial call for controls, infoBox, and plots
  neighborhoodsControl(
    map,
    neighborhoods,
    neighborhoodsLayer,
    listingsData,
    priceAvailabilityData
  );
  updateInfoBox(listingsData, "Washington, D.C.");
  allDCPlots(listingsData, priceAvailabilityData, defaultColors);

  // event listeners for plot and map resizing
  window.addEventListener("resize", resizePlots);

  // resize map to current container size
  map.invalidateSize();

  // resize plots
  resizePlots();
}

// create dropdown for neighborhood interaction
function neighborhoodsControl(
  map,
  neighborhoodsInfo,
  neighborhoodsLayer,
  listingsData,
  priceAvailabilityData
) {
  // create neighorhoods dropdown menu
  const controlDiv = document.getElementById("neighborhoods-control");
  const dropdown = document.createElement("select");
  dropdown.id = "neighborhoods-dropdown";
  controlDiv.innerHTML = `<div class="control-header">
    <label for="neighborhoods-dropdown">Select a Neighborhood</label>
    <br>
    </div>`;
  controlDiv.appendChild(dropdown);

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

  // event listener, calls to update page to user's selection
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
function createMarkers(data, colorBy = null) {
  // process data for license status
  data = setLicenseStatus(data);

  // empty marker layer
  const markers = L.layerGroup();

  // loop to populate markers
  data.forEach((listing) => {
    let markerColor = defaultColors.airbnbs; // default color

    // determine marker color based on colorBy parameter
    if (colorBy === "license") {
      markerColor = licenseColors[listing.licenseCategory] || licenseColors.default;
    } else if (colorBy === "propertyType") {
      markerColor = propertyTypeColors[listing.room_type] || propertyTypeColors.default;
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
      colors = ["green", "yellow", "red"];
      div.innerHTML = '<div class="legend-title">License Status</div>';
      console.log(colors);
    } else if (type === "Property Type") {
      labels = ["Entire home/apt", "Private room", "Shared room", "Hotel room"];
      colors = ["orange", "blue", "green", "red"];
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

// resets map view to all of D.C., updates infoBox and plots
function resetMapView(
  map,
  neighborhoodsLayer,
  listingsData,
  priceAvailabilityData
) {
  map.setView([38.89511, -77.03637], 12);
  map.removeLayer(neighborhoodsLayer); // remove neighborhood boundaries from zoomIn()
  // call to update infoBox and plots
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

    // add new markers
    createMarkers(filteredListings).addTo(map);
    // newMarkers.addTo(map);

    // update infoBox, and plots
    // const newMarkers = createMarkers(listingsData);
    // newMarkers.addTo(map);
    updateInfoBox(listingsData, selectedNeighborhood);
    neighborhoodPlots(
      listingsData,
      selectedNeighborhood,
      priceAvailabilityData,
      defaultColors
    );
  }
}
