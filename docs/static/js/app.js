// to check if running on GitHub Pages or Flask app
const isGitPages = window.location.hostname.includes('github.io');
const isHostedLocally = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'; // for testing locally
const isFlaskApp = isHostedLocally && window.location.port === '5000'; // assuming Flask runs on port 5000

// set data source based on environment
if (isGitPages || (isHostedLocally && !isFlaskApp)) {
  // for GitHub Pages or local testing of GitHub Pages version
  geojson = "./static/resources/neighbourhoods.geojson";
  getData = d3.csv("./static/resources/airbnb_data.csv");
} else {
  // for Flask app
  geojson = "/static/resources/neighbourhoods.geojson";
  getData = fetch("/api/listings").then((response) => response.json());
}
// fetch data and geojson
getData.then((data) => {
    fetch(geojson)
    .then((response) => response.json())
    .then((neighborhoodData) => {
        createMap(createMarkers(data), neighborhoodData, data);
    });
});

