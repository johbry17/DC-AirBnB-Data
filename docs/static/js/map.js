// map creation
function createMap(airbnbs, neighborhoods, listingsData) {
  // initialize map
  const map = L.map("map-id", {
    center: [38.89511, -77.03637],
    zoom: 12,
  });

  // add baseLayer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // initialize neighborhoodLayer
  const neighborhoodsLayer = L.geoJSON(neighborhoods, {
    style: {
      // opacity: 0,
      color: "black",
      weight: 3,
    },
  });

  // add markers
  airbnbs.addTo(map);

  // initial call for controls, infoBox, and plots
  neighborhoodsControl(map, neighborhoods, neighborhoodsLayer, listingsData);
  updateInfoBox(listingsData, "Washington, D.C.");
  allDCPlots(listingsData);

  // resize map to current container size
  map.invalidateSize();
}

// create dropdown for neighborhood interaction
function neighborhoodsControl(
  map,
  neighborhoodsInfo,
  neighborhoodsLayer,
  listingsData
) {
  // create neighorhoods dropdown menu
  const controlDiv = document.getElementById("neighborhoods-control");
  const dropdown = document.createElement("select");
  dropdown.id = "neighborhoods-dropdown";
  controlDiv.innerHTML = `<div class="control-header">
    <label for="neighborhoods-dropdown" style="color: white;">Select a Neighborhood</label>
    <br>
    </div>`;
  controlDiv.appendChild(dropdown);

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
      resetMapView(map, neighborhoodsLayer, listingsData);
    } else {
      zoomIn(map, neighborhoodsLayer, selectedNeighborhood, listingsData);
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

// initialize markers with settings
function createMarkers(data) {
  // empty marker layer
  const markers = L.layerGroup();

  // marker design
  const markerOptions = {
    radius: 2,
    fillColor: "blue",
    color: "black",
    weight: 1,
    fillOpacity: 1,
  };

  // loop to populate markers
  data.forEach((listing) => {
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

    markers.addLayer(marker);
  });

  return markers;
}

// populates popup
function createPopupContent(listing) {
  const price = parseFloat(listing.price);
  const hostVerified =
    listing.host_identity_verified === true ? "Verified" : "Unverified";
  const hoverDescription = listing.hover_description
    ? `<h4>${listing.hover_description}</h4>`
    : "<h4>Description not available</h4>";

  return `
    ${hoverDescription}
    <a href="${listing.listing_url}" target="_blank">Link to listing</a><br>
    Price: $${price.toFixed(2)}<br>
    Property Type: ${listing.property_type}<br>
    Accommodates: ${listing.accommodates}<br>
    Rating: ${listing.review_scores_rating}<br>
    Host: ${listing.host_name}<br>
    Host Verified: ${hostVerified}<br>
    Host Total Listings: ${listing.host_total_listings_count}<br>
    License: ${listing.license}<br>
  `;
}

// resets map view to all of D.C., updates infoBox and plots
function resetMapView(map, neighborhoodsLayer, listingsData) {
  map.setView([38.89511, -77.03637], 12);
  map.removeLayer(neighborhoodsLayer);  // remove neighborhood boundaries from zoomIn()
  // call to update infoBox and plots
  updateInfoBox(listingsData, "Washington, D.C.");
  allDCPlots(listingsData);
}

// zooms map for neighborhood view, updates infoBox and plots
function zoomIn(map, neighborhoodsLayer, selectedNeighborhood, listingsData) {
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
    neighborhoodsLayer.addTo(map);
    // update markers, infoBox, and plots
    const newMarkers = createMarkers(listingsData);
    newMarkers.addTo(map);
    updateInfoBox(listingsData, selectedNeighborhood);
    neighborhoodPlots(listingsData, selectedNeighborhood);
  }
}
