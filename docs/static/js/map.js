// main map creation
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
      color: "blue",
      weight: 3,
    },
  });

  // add markers
  airbnbs.addTo(map);

  // call function to manage user interaction with neighborhoods
  neighborhoodsControl(map, neighborhoods, neighborhoodsLayer, listingsData);

  // call dcInfoBox to display stats for all of D.C. initially
  calculateDCStats(listingsData); // Ensure DC stats are calculated first
  dcInfoBox(listingsData, neighborhoodsLayer);
  
  updateInfoBox(listingsData, neighborhoodsLayer);

  // resize map to current container size
  map.invalidateSize();
}

// marker creation and settings
function createMarkers(data) {
  // empty marker layer
  markers = L.layerGroup();

  // marker design
  markerOptions = {
    radius: 2,
    fillColor: "red",
    color: "black",
    weight: 1,
    fillOpacity: 1,
  };

  // loop to populate markers
  data.forEach((listing) => {
    let marker = L.circleMarker(
      [listing.latitude, listing.longitude],
      markerOptions
    );

    // call function to fill in popup content
    popUpContent = createPopupContent(listing);

    // marker info popups
    marker.bindPopup(popUpContent, { className: "marker-popup" });

    // boolean to track if a popup is open
    let popupOpen = false;

    // open popup on mouseover
    marker.on("mouseover", (e) => marker.openPopup());

    // close popup on mouseout
    marker.on("mouseout", (e) => {
      if (!popupOpen) {
        marker.closePopup();
      }
    });

    // open popup on click
    marker.on("click", (e) => {
      if (popupOpen) {
        marker.closePopup();
      } else {
        marker.openPopup();
      }
      //toggle popupOpen boolean
      popupOpen = !popupOpen;
    });

    markers.addLayer(marker);
  });

  return markers;
}

// populates popup
function createPopupContent(listing) {
  price = parseFloat(listing.price);
  hostVerified = listing.host_identity_verified === true ? 'Verified' : 'Unverified'
  hoverDescription = listing.hover_description ? `<h4>${listing.hover_description}</h4>` : '<h4>Description not available</h4>';
  
  return `${hoverDescription}
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

// create dropdown for neighborhood interaction
function neighborhoodsControl(map, neighborhoodsInfo, neighborhoodsLayer, listingsData) {
  // get dropdown element
  const controlDiv = document.getElementById("neighborhoods-control");

  // create box and text for dropdown
  controlDiv.innerHTML = `
    <div class="control-header">
      <label for="neighborhoods-dropdown">Select a Neighborhood</label>
      <br>
      <select id="neighborhoods-dropdown"></select>
    </div>`;

  // get and populate dropdown menu
  const dropdown = document.getElementById("neighborhoods-dropdown");

  // set first dropdown choice for initial map view
  let allDC = document.createElement("option");
  allDC.text = "Washington, D.C.";
  allDC.value = "top";
  dropdown.appendChild(allDC);

  // populate dropdown menu with neighborhoods
  neighborhoodsInfo.features.forEach((feature) => {
    names = feature.properties.neighbourhood;
    option = document.createElement("option");
    option.text = names;
    option.value = names;
    dropdown.appendChild(option);
  });

  // changes view to user's selection
  dropdown.addEventListener("change", function () {
    const selectedNeighborhood = this.value;

    if (selectedNeighborhood === "top") {
      map.setView([38.89511, -77.03637], 12);
      // neighborhoodsLayer is on when zoomed in
      map.removeLayer(neighborhoodsLayer);
      // update infoBox for all DC
      dcInfoBox(listingsData, neighborhoodsLayer);
    } else {
      zoomIn(map, neighborhoodsLayer, selectedNeighborhood, listingsData);
    }
  });
}

// handles neighborhood view
function zoomIn(map, neighborhoodsLayer, neighborhoodDesignation, listingsData) {
  // initialize boundaries first, or it won't zoom
  let boundaries;

  // remove any boundaries from prior calls of zoomIn()
  neighborhoodsLayer.resetStyle(boundaries);

  // get borders of selected neighborhood
  boundaries = neighborhoodsLayer
    .getLayers()
    .find(
      (layer) =>
        layer.feature.properties.neighbourhood === neighborhoodDesignation
    );

  // transparent boundary removes neighborhoodsLayer opacity from selected neighborhood
  // the contrast makes the neighborhood stand out
  boundaries.setStyle({
    weight: 3,
    color: "transparent",
  });

  // zoom in on selected neighborhood
  map.fitBounds(boundaries.getBounds());

  // add neighborhoodsLayer for contrast
  neighborhoodsLayer.addTo(map);

  // reload marker popups
  newMarkers = createMarkers(listingsData);
  newMarkers.addTo(map);
  
  updateInfoBox(listingsData, neighborhoodDesignation);
}

