// variables to check if running on GitHub Pages or Flask app
const isGitPages = window.location.hostname.includes("github.io"); // for GitHub Pages
const isHostedLocally =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"; // for testing locally
const isFlaskApp = isHostedLocally && window.location.port === "5000"; // assuming Flask runs on port 5000

// set data source based on environment
const geojson =
  isGitPages || (isHostedLocally && !isFlaskApp)
    ? "./static/resources/neighbourhoods.geojson"
    : "/static/resources/neighbourhoods.geojson";
const getData =
  isGitPages || (isHostedLocally && !isFlaskApp)
    ? d3.csv("./static/resources/airbnb_data.csv")
    : fetch("/api/listings").then((response) => response.json());

// fetch data and geojson, then create map
Promise.all([getData, fetch(geojson).then((response) => response.json())]).then(
  ([data, neighborhoodData]) => {
    createMap(createMarkers(data), neighborhoodData, data);
  }
);

// infoBox
function updateInfoBox(listingsData, selectedNeighborhood) {
  const infoBoxElement = document.querySelector("#info-box");

  // get stats for DC, maybe for neighborhood
  const stats = calculateStats(listingsData);
  const filteredListings = filterListingsByNeighborhood(listingsData, selectedNeighborhood);
  const neighborhoodStats = selectedNeighborhood === "Washington, D.C." ? null : calculateStats(filteredListings);
  // create HTML for infoBox
  const isDC = selectedNeighborhood === "Washington, D.C.";
  const statsHTML = isDC
    ? `
    <strong>Washington, D.C.</strong><br>
    Number of AirBnB's: ${listingsData.length}<br>
    Mean Price: $${stats.meanPrice.toFixed(2)}<br>
    Median Price: $${stats.medianPrice.toFixed(2)}<br>
    Mean Rating: ${stats.meanRating.toFixed(2)}<br>
    Median Rating: ${stats.medianRating.toFixed(2)}<br>
    `
    : `
    <strong>${selectedNeighborhood}</strong><br>
    Number of AirBnB's in Neighborhood: ${filteredListings.length}<br>
    <br>
    <strong>Neighborhood Stats:</strong><br>
    Mean Price: $${neighborhoodStats.meanPrice.toFixed(2)}<br>
    Median Price: $${neighborhoodStats.medianPrice.toFixed(2)}<br>
    Mean Rating: ${neighborhoodStats.meanRating.toFixed(2)}<br>
    Median Rating: ${neighborhoodStats.medianRating.toFixed(2)}<br>
    <br>
    <strong>Washington, D.C. (Comparison):</strong><br>
    Mean Price: $${stats.meanPrice.toFixed(2)}<br>
    Median Price: $${stats.medianPrice.toFixed(2)}<br>
    Mean Rating: ${stats.meanRating.toFixed(2)}<br>
    Median Rating: ${stats.medianRating.toFixed(2)}
    `;

  // update infoBox
  infoBoxElement.innerHTML = statsHTML;
}

// filter listings by neighborhood
function filterListingsByNeighborhood(listingsData, selectedNeighborhood) {
  return listingsData.filter(
    (listing) => listing.neighbourhood === selectedNeighborhood
  );
}

// calculate stats for data, filter out NaN values
function calculateStats(data) {
  const prices = data
    .map((listing) => parseFloat(listing.price))
    .filter((price) => !isNaN(price));
  const ratings = data
    .filter((listing) => listing.review_scores_rating !== null)
    .map((listing) => parseFloat(listing.review_scores_rating))
    .filter((rating) => !isNaN(rating));

  return {
    meanPrice: calculateMean(prices),
    medianPrice: calculateMedian(prices),
    meanRating: calculateMean(ratings),
    medianRating: calculateMedian(ratings),
  };
}

// calculate mean
function calculateMean(data) {
  return data.reduce((sum, value) => sum + value, 0) / data.length;
}

// calculate median
function calculateMedian(data) {
  const sortedData = data.sort((a, b) => a - b);
  const mid = Math.floor(sortedData.length / 2);
  return sortedData.length % 2 === 0
    ? (sortedData[mid - 1] + sortedData[mid]) / 2
    : sortedData[mid];
}
