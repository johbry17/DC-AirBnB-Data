// Description: Main JavaScript file for the DC Airbnb Data Analysis project

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
Promise.all([
  getData,
  fetch(geojson).then((response) => response.json()),
  getPriceAvailabilityData,
]).then(([data, neighborhoodData, priceAvailabilityData]) => {
  // filter out listings with price > 3000
  // a few listings have prices above this, errors in data entry
  // like, a $7,000/night dorm room, which should be $70/night
  data = data.filter((listing) => parseFloat(listing.price) <= 3000);

  createMap(neighborhoodData, data, priceAvailabilityData);
});

// infoBox
function updateInfoBox(listingsData, selectedNeighborhood) {
  const allListingsCount = listingsData.length;
  const filteredListings = selectedNeighborhood === "Washington, D.C."
    ? listingsData
    : filterListingsByNeighborhood(listingsData, selectedNeighborhood);

  // get stats for DC and neighborhood
  const neighborhoodStats = calculateStats(filteredListings);
  const dcStats = calculateStats(listingsData);

  // cache DOM elements that will be updated
  const elements = {
    neighborhoodName: document.getElementById("neighborhood-name"),
    neighborhoodCount: document.getElementById("neighborhood-count"),
    totalCount: document.getElementById("total-count"),
    totalCountAllDc: document.getElementById("total-count-all-dc"),
    dcMeanPrice: document.getElementById("dc-mean-price"),
    dcMedianPrice: document.getElementById("dc-median-price"),
    neighborhoodMeanPrice: document.getElementById("neighborhood-mean-price"),
    neighborhoodMedianPrice: document.getElementById("neighborhood-median-price"),
    neighborhoodToggles: document.querySelectorAll(".neighborhood-toggle"),
    allDcComparison: document.getElementById("all-dc-comparison"),
  };

  // update text content
  elements.neighborhoodName.textContent = selectedNeighborhood;
  elements.neighborhoodCount.textContent = filteredListings.length.toLocaleString();
  elements.totalCount.textContent = allListingsCount.toLocaleString();
  elements.totalCountAllDc.textContent = allListingsCount.toLocaleString();
  elements.dcMeanPrice.textContent = `$${dcStats.meanPrice.toFixed(2)}`;
  elements.dcMedianPrice.textContent = `$${dcStats.medianPrice.toFixed(2)}`;

  if (selectedNeighborhood !== "Washington, D.C.") {
    elements.neighborhoodMeanPrice.textContent = `$${neighborhoodStats.meanPrice.toFixed(2)}`;
    elements.neighborhoodMedianPrice.textContent = `$${neighborhoodStats.medianPrice.toFixed(2)}`;
  }

  // toggle visibility of neighborhood comparison stats
  const displayStyle = selectedNeighborhood === "Washington, D.C." ? "none" : "block";
  elements.neighborhoodToggles.forEach((toggle) => toggle.style.display = displayStyle);
  elements.allDcComparison.style.display = selectedNeighborhood === "Washington, D.C." ? "block" : "none";
}