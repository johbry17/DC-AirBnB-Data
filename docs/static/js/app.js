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

  // update neighborhood info
  document.getElementById("neighborhood-name").innerText = selectedNeighborhood;
  document.getElementById("neighborhood-count").innerText =
    filteredListings.length.toLocaleString();
  document.getElementById("total-count").innerText =
    listingsData.length.toLocaleString();
  document.getElementById("total-count-all-dc").innerText =
    listingsData.length.toLocaleString();
  document.getElementById(
    "dc-mean-price"
  ).innerText = `$${stats.meanPrice.toFixed(2)}`;
  document.getElementById(
    "dc-median-price"
  ).innerText = `$${stats.medianPrice.toFixed(2)}`;

  if (neighborhoodStats) {
    document.getElementById(
      "neighborhood-mean-price"
    ).innerText = `$${neighborhoodStats.meanPrice.toFixed(2)}`;
    document.getElementById(
      "neighborhood-median-price"
    ).innerText = `$${neighborhoodStats.medianPrice.toFixed(2)}`;
  }

  // toggle display of neighborhood comparison stats
  const neighborhoodToggles = document.querySelectorAll(".neighborhood-toggle");
  const displayStyle =
    selectedNeighborhood === "Washington, D.C." ? "none" : "block";
  neighborhoodToggles.forEach((div) => (div.style.display = displayStyle));
  document.getElementById("all-dc-comparison").style.display =
    selectedNeighborhood === "Washington, D.C." ? "block" : "none";

  // update infoBox
  infoBoxElement.innerHTML = infoBoxElement.innerHTML; // trigger an update
}

// // filter listings by neighborhood
// function filterListingsByNeighborhood(listingsData, selectedNeighborhood) {
//   return listingsData.filter(
//     (listing) => listing.neighbourhood === selectedNeighborhood
//   );
// }
