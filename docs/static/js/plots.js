// infoBox for all of DC
function dcInfoBox(listingsData, neighborhoodsLayer) {
    let infoBoxElement = document.querySelector("#info-box");
  
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
  function updateInfoBox(listingsData, neighborhoodDesignation) {
  
    // filter to selected neighborhood
    let neighborhoodListings = listingsData.filter(
      (listing) => listing.neighbourhood === neighborhoodDesignation
    );
    
    // Find the info box element
    let infoBoxElement = document.querySelector("#info-box");
  
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
  
  
  function calculateDCStats(listingsData) {
    // prices
    dcMeanPrice = listingsData.reduce((sum, listing) => sum + parseFloat(listing.price), 0) / listingsData.length;
    dcMedianPrice = calculateMedian(listingsData, (listing) => parseFloat(listing.price));
  
    // ratings
    let nonNullRatings = listingsData.filter((listing) => listing.review_scores_rating !== null);
    dcMeanRating = nonNullRatings.reduce((sum, listing) => sum + parseFloat(listing.review_scores_rating), 0) / nonNullRatings.length;
    dcMedianRating = calculateMedian(nonNullRatings, (listing) => parseFloat(listing.review_scores_rating));
    
    // return [dcMeanPrice, dcMedianPrice, dcMeanRating, dcMedianRating];
  };
  
  // calculates the median of an array of numbers
  function calculateMedian(neighborhoodListings, value) {
    // create and sort array of values
    values = neighborhoodListings.map(value);
    values.sort((a, b) => a-b);
  
    // select midpoint - Math.floor to round down to an int, to get the index of the array
    mid = Math.floor(values.length / 2);
    if (values.length % 2 === 0) {
      return (values[mid - 1] + values[mid]) / 2;
    } else {
      return values[mid];
    }
  }