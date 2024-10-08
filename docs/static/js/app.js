// variables to check if running on GitHub Pages or Flask app
const isGitPages = window.location.hostname.includes("github.io"); // for GitHub Pages
const isHostedLocally =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"; // for testing locally
const isFlaskApp = isHostedLocally && window.location.port === "5000"; // assuming Flask runs on port 5000

// set data source based on environment
const geojson =
  isGitPages || (isHostedLocally && !isFlaskApp)
    ? "./static/resources/neighbourhoods_cleaned.geojson"
    : "/static/resources/neighbourhoods_cleaned.geojson";
const getData =
  isGitPages || (isHostedLocally && !isFlaskApp)
    ? d3.csv("./static/resources/airbnb_data.csv")
    : fetch("/api/listings").then((response) => response.json());
const getPriceAvailabilityData =
  isGitPages || (isHostedLocally && !isFlaskApp)
    ? d3.csv("./static/resources/price_availability_data.csv")
    : fetch("/api/price_availability").then((response) => response.json());

// fetch data and geojson, then create map
Promise.all([getData, fetch(geojson).then((response) => response.json()), getPriceAvailabilityData]).then(
  ([data, neighborhoodData, priceAvailabilityData]) => {
    createMap(neighborhoodData, data, priceAvailabilityData);
  }
);

// infoBox
function updateInfoBox(listingsData, selectedNeighborhood) {
  const infoBoxElement = document.querySelector("#info-box");

  // get stats for DC, maybe for neighborhood
  const stats = calculateStats(listingsData);
  const filteredListings = filterListingsByNeighborhood(
    listingsData,
    selectedNeighborhood
  );
  const neighborhoodStats =
    selectedNeighborhood === "Washington, D.C."
      ? null
      : calculateStats(filteredListings);
  // create HTML for infoBox
  const isDC = selectedNeighborhood === "Washington, D.C.";
  const statsHTML = isDC
    ? `
    <i class="fas fa-info-circle"></i>
    <br>
    Number of Airbnb's in all of <b style="font-size: 1.2em;">Washington, D.C.</b>: ${listingsData.length.toLocaleString()}<br>
    Mean Price: $${stats.meanPrice.toFixed(2)}<br>
    Median Price: $${stats.medianPrice.toFixed(2)}<br>
    `
    : `
    <strong>${selectedNeighborhood}</strong><br>
    <i class="fas fa-info-circle"></i>
    <br>
    Number of Airbnb's in Neighborhood: ${filteredListings.length.toLocaleString()}<br>
    <u><b style="font-size: 1.2em;">Neighborhood Stats:</b></u><br>
    Mean Price: $${neighborhoodStats.meanPrice.toFixed(2)}<br>
    Median Price: $${neighborhoodStats.medianPrice.toFixed(2)}<br>
    <div class="stats-icons">
        <i class="fas fa-dollar-sign"></i>
        <i class="fas fa-star"></i>
    </div>
    <u><b style="font-size: 1.2em;">Washington, D.C.</b> (for Comparison):</u><br>
    Mean Price: $${stats.meanPrice.toFixed(2)}<br>
    Median Price: $${stats.medianPrice.toFixed(2)}<br>
    `;

    // Mean Rating: ${neighborhoodStats.meanRating.toFixed(2)} \u2605<br>
    // Median Rating: ${neighborhoodStats.medianRating.toFixed(2)} \u2605<br>   
    // Mean Rating: ${stats.meanRating.toFixed(2)} \u2605<br>
    // Median Rating: ${stats.medianRating.toFixed(2)} \u2605

  // update infoBox
  infoBoxElement.innerHTML = statsHTML;
}

// filter listings by neighborhood
function filterListingsByNeighborhood(listingsData, selectedNeighborhood) {
  return listingsData.filter(
    (listing) => listing.neighbourhood === selectedNeighborhood
  );
}
