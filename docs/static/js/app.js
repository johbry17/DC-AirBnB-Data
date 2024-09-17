// check if running on GitHub Pages or Flask app
const isGitPages = window.location.hostname.includes('github.io');
const isHostedLocally = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'; // for testing locally
const isFlaskApp = isHostedLocally && window.location.port === '5000'; // assuming Flask runs on port 5000

// fetch data based on environment
if (isGitPages || (isHostedLocally && !isFlaskApp)) {
  // for GitHub Pages or local testing of GitHub Pages version
  d3.csv("./static/resources/airbnb_data.csv")
    .then((data) => {
      // listingsData = data;
    //   [dcMeanPrice, dcMedianPrice, dcMeanRating, dcMedianRating] = calculateDCStats(data);
      fetch("./static/resources/neighbourhoods.geojson")
        .then((response) => response.json())
        .then((neighborhoodData) => {
          createMap(createMarkers(data), neighborhoodData, data);
        });
    });
} else {
  // for Flask app
  fetch("/api/listings")
    .then((response) => response.json())
    .then((data) => {
      // listingsData = data;
    //   [dcMeanPrice, dcMedianPrice, dcMeanRating, dcMedianRating] = calculateDCStats(data);
      fetch("/static/resources/neighbourhoods.geojson")
        .then((response) => response.json())
        .then((neighborhoodData) => {
          createMap(createMarkers(data), neighborhoodData, data);
        });
    });
}

