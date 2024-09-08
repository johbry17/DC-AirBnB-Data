// define globals
let map; // main map
let neighborhoodsLayer; // polygons of neighborhoods
let listingsData; // to reload marker popups in neighborhood view

// call for data from server
d3.csv("./static/resources/airbnb_data.csv") // for gitHub Pages
// fetch("/api/listings") // for flask app
//   .then((response) => response.json()) // for flask app
  .then((data) => {
    listingsData = data;
    [dcMeanPrice, dcMedianPrice, dcMeanRating, dcMedianRating] = calculateDCStats(data);
    fetch("./static/resources/neighbourhoods.geojson")
      .then((response) => response.json())
      .then((neighborhoodData) => {
        createMap(createMarkers(data), neighborhoodData);
      });
  });

// main map creation
function createMap(airbnbs, neighborhoods) {
  // initialize map
  map = L.map("map-id", {
    center: [38.89511, -77.03637],
    zoom: 12,
  });

  // add baseLayer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // initialize neighborhoodLayer
  neighborhoodsLayer = L.geoJSON(neighborhoods, {
    style: {
      // opacity: 0,
      color: "blue",
      weight: 3,
    },
  });

  // add markers
  airbnbs.addTo(map);

  // call function to manage user interaction with neighborhoods
  neighborhoodsControl(map, neighborhoods);

  // create info box
  let infoBox = L.control({ position: "bottomleft" });

  infoBox.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend neighborhood-info");
    div.innerHTML =`<strong>Welcome to the map</strong><br>
      Choose a neighborhood for a closer look<br>
      Click on an AirBnB to investigate a listing<br>
      Return here to see summary stats for all of DC`;
    return div;
  };

  infoBox.addTo(map);

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
function neighborhoodsControl(map, neighborhoodsInfo) {
  //  initialize and position neighborhoodControl
  let neighborhoodControl = L.control({ position: "topright" });

  // create box and text for dropdown
  neighborhoodControl.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend neighborhood-control");
    div.innerHTML =
      '<div class="control-header">' +
      '<label for="neighborhoods-dropdown">Select a Neighborhood</label>' +
      "<br>" +
      '<select id="neighborhoods-dropdown"></select>';
    return div;
  };

  neighborhoodControl.addTo(map);

  dropdown = document.getElementById("neighborhoods-dropdown");

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
    selectedNeighborhood = this.value;

    if (selectedNeighborhood === "top") {
      map.setView([38.89511, -77.03637], 12);
      // neighborhoodsLayer is on when zoomed in
      map.removeLayer(neighborhoodsLayer);
      // update infoBox for all DC
      dcInfoBox();
    } else {
      zoomIn(selectedNeighborhood);
    }
  });
}

// handles neighborhood view
function zoomIn(neighborhoodDesignation) {
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
  
  updateInfoBox(neighborhoodDesignation);
}

// infoBox for all of DC
function dcInfoBox() {
  let infoBoxElement = document.querySelector(".neighborhood-info");

  infoBoxElement.innerHTML = "";
  
  infoBoxElement.innerHTML = `<strong>Washington, D.C.</strong><br>
  Number of AirBnB's: ${listingsData.length}<br>
  Mean Price: $${dcMeanPrice.toFixed(2)}<br>
  Median Price: $${dcMedianPrice.toFixed(2)}<br>
  Mean Rating: ${dcMeanRating.toFixed(2)}<br>
  Median Rating: ${dcMedianRating.toFixed(2)}<br>`;

  // remove any boundaries from prior calls of zoomIn()
  neighborhoodsLayer.resetStyle();
}

// changes infoBox summary for neighborhoods
function updateInfoBox(neighborhoodDesignation) {

  // filter to selected neighborhood
  let neighborhoodListings = listingsData.filter(
    (listing) => listing.neighbourhood === neighborhoodDesignation
  );
  
  // Find the info box element
  let infoBoxElement = document.querySelector(".neighborhood-info");

  // Update the content of the info box for neighborhoods
  if (infoBoxElement) {
    // price
    meanPrice = neighborhoodListings.reduce((sum, listing) => sum + parseFloat(listing.price), 0) / neighborhoodListings.length;
    medianPrice = calculateMedian(neighborhoodListings, (listing) => parseFloat(listing.price))
    // ratings
    let nonNullRatings = neighborhoodListings.filter((listing) => listing.review_scores_rating !== null);
    meanRating = nonNullRatings.reduce((sum, listing) => sum + parseFloat(listing.review_scores_rating), 0) / nonNullRatings.length;
    medianRating = calculateMedian(nonNullRatings, (listing) => parseFloat(listing.review_scores_rating));

    infoBoxElement.innerHTML = 
    `<strong>${neighborhoodDesignation}</strong><br>
    Number of AirBnB's in Neighborhood: ${neighborhoodListings.length}
    <div id="infoBox-container">
        <div id="infoBox-chart" class = "infoBox-chart"></div>
      <select id="infoBox-selector">
        <option value="price">Price</option>
        <option value="ratings">Ratings</option>
      </select>
    </div>`;

    // set to price by default
    infoBoxChart(neighborhoodDesignation, 'price');

    infoBoxChange = document.getElementById('infoBox-selector')
    infoBoxChange.addEventListener('change', function() {
      chosenChart = infoBoxChange.value;
      infoBoxChart(neighborhoodDesignation, chosenChart);
    });
  };
};

// neighborhood vs. DC chart function
function infoBoxChart(neighborhoodDesignation, chartType) {
  // determine which chart to plot
  let chosenData, yTitle;
  if (chartType === 'price') {
    chosenData = [meanPrice, medianPrice, dcMeanPrice, dcMedianPrice];
    yTitle = 'Price';
    // to dynamically narrow y-axis to emphasize difference
    minRange = Math.min(...chosenData) - 20;
    maxRange = Math.max(...chosenData) + 20;
  } else if (chartType === 'ratings') {
    chosenData = [meanRating, medianRating, dcMeanRating, dcMedianRating];
    yTitle = 'Rating';
    minRange = Math.min(...chosenData) - .2;
    maxRange = Math.max(...chosenData) + .2;
  }

  trace = {
    x: ['Mean (Neighborhood)', 'Median (Neighborhood)', 'Mean (All of DC)', 'Median (All of DC)'],
    y: chosenData,
    type: 'bar',
    hovertemplate: chartType === 'price' ? '%{y:$,.2f}' : '%{y:.2f}',
    marker: {
      color: ['blue', 'blue', 'red', 'red'],
      line: {
        color: 'black',
        width: 1,
      },
    },
  }

  layout = {
    xaxis: { tickangle: 35, },
    yaxis: { title: yTitle, range: [minRange, maxRange] },
  }

  Plotly.newPlot("infoBox-chart", [trace], layout);
}


function calculateDCStats(data) {
  // prices
  dcMeanPrice = listingsData.reduce((sum, listing) => sum + parseFloat(listing.price), 0) / listingsData.length;
  dcMedianPrice = calculateMedian(listingsData, (listing) => parseFloat(listing.price));

  // ratings
  let nonNullRatings = listingsData.filter((listing) => listing.review_scores_rating !== null);
  dcMeanRating = nonNullRatings.reduce((sum, listing) => sum + parseFloat(listing.review_scores_rating), 0) / nonNullRatings.length;
  dcMedianRating = calculateMedian(nonNullRatings, (listing) => parseFloat(listing.review_scores_rating));
  
  return [dcMeanPrice, dcMedianPrice, dcMeanRating, dcMedianRating];
};

// calculates the median of an array of numbers
function calculateMedian(neighborhoodListings, value) {
  // create and sort array of values
  values = neighborhoodListings.map(value);
  values.sort((a, b) => a-b);

  // select midpoint - Math.floor to round down to an int, to get the index of the array
  mid = Math.floor(values.length /2);
  if (values.length % 2 === 0) {
    return (values[mid - 1] + values[mid]) / 2;
  } else {
    return values[mid];
  }
}