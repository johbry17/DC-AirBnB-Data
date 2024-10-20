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

// main infoBox values
function updateInfoBox(listingsData, selectedNeighborhood) {
  const allListingsCount = listingsData.length;
  const filteredListings =
    selectedNeighborhood === "Washington, D.C."
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
    neighborhoodMedianPrice: document.getElementById(
      "neighborhood-median-price"
    ),
    neighborhoodPriceDiff: document.getElementById("mean-price-diff"),
    neighborhoodMedianDiff: document.getElementById("median-price-diff"),
    neighborhoodToggles: document.querySelectorAll(".neighborhood-toggle"),
    allDcComparison: document.querySelectorAll(".all-dc-comparison"),
  };

  // update text content
  elements.neighborhoodName.textContent = selectedNeighborhood;
  elements.neighborhoodCount.textContent =
    filteredListings.length.toLocaleString();
  elements.totalCount.textContent = allListingsCount.toLocaleString();
  elements.totalCountAllDc.textContent = allListingsCount.toLocaleString();
  elements.dcMeanPrice.textContent = `$${dcStats.meanPrice.toFixed(2)}`;
  elements.dcMedianPrice.textContent = `$${dcStats.medianPrice.toFixed(2)}`;

  if (selectedNeighborhood !== "Washington, D.C.") {
    elements.neighborhoodMeanPrice.textContent = `$${neighborhoodStats.meanPrice.toFixed(
      2
    )}`;
    elements.neighborhoodMedianPrice.textContent = `$${neighborhoodStats.medianPrice.toFixed(
      2
    )}`;
    const meanDiff =
      ((neighborhoodStats.meanPrice - dcStats.meanPrice) / dcStats.meanPrice) *
      100;
    const medianDiff =
      ((neighborhoodStats.medianPrice - dcStats.medianPrice) /
        dcStats.medianPrice) *
      100;
    elements.neighborhoodPriceDiff.textContent = `${
      meanDiff >= 0 ? "+" : ""
    }${meanDiff.toFixed(0)}%`;
    elements.neighborhoodMedianDiff.textContent = `${
      medianDiff >= 0 ? "+" : ""
    }${medianDiff.toFixed(0)}%`;
  }

  // toggle visibility of neighborhood comparison stats
  const displayStyle =
    selectedNeighborhood === "Washington, D.C." ? "none" : "block";
  elements.neighborhoodToggles.forEach(
    (toggle) => (toggle.style.display = displayStyle)
  );
  elements.allDcComparison.forEach(
    (comparison) =>
      (comparison.style.display =
        selectedNeighborhood === "Washington, D.C." ? "block" : "none")
  );
}

// 31 minimum nights info box values
function update31DaysInfoBox(listingsData, selectedNeighborhood) {
  // conditional for neighborhood filter
  let filteredListings;
  if (selectedNeighborhood === "Washington, D.C.") {
    filteredListings = listingsData;
  } else {
    filteredListings = filterListingsByNeighborhood(
      listingsData,
      selectedNeighborhood
    );
  }

  // get count and percent for 31-day minimum stay
  const { countAt31Days, percentAt31Days } =
    getListingsAt31Days(filteredListings);

  // populate the HTML
  document.getElementById("count-31-nights").textContent =
    countAt31Days.toLocaleString();
  document.getElementById("total-31-nights").textContent =
    filteredListings.length.toLocaleString();
  document.getElementById(
    "percent-31-nights"
  ).textContent = `${percentAt31Days}%`;
}

// multi-property info box values
function updateMultiListings(listingsData, selectedNeighborhood) {
  // conditional for neighborhood filter
  let filteredListings;
  if (selectedNeighborhood === "Washington, D.C.") {
    filteredListings = listingsData;
  } else {
    filteredListings = filterListingsByNeighborhood(
      listingsData,
      selectedNeighborhood
    );
  }

  // get count and percent for multi-property hosts
  const { multiPropertyListings, totalListings, percentMultiProperties } =
    getMultiPropertyData(filteredListings);

  // populate the HTML
  document.getElementById("count-multi-properties").textContent = multiPropertyListings.toLocaleString();
  document.getElementById("total-multi-properties").textContent = totalListings.toLocaleString();
  document.getElementById("percent-multi-properties").textContent = `${percentMultiProperties}%`;
}