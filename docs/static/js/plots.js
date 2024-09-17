// infoBox for all of DC
function dcInfoBox(listingsData, neighborhoodsLayer) {
    let infoBoxElement = document.querySelector("#info-box");
  
    const dcStats = calculateDCStats(listingsData);
    const { dcMeanPrice, dcMedianPrice, dcMeanRating, dcMedianRating } = dcStats;
    
    infoBoxElement.innerHTML = `
        <strong>Washington, D.C.</strong><br>
        Number of AirBnB's: ${listingsData.length}<br>
        Mean Price: $${dcMeanPrice.toFixed(2)}<br>
        Median Price: $${dcMedianPrice.toFixed(2)}<br>
        Mean Rating: ${dcMeanRating.toFixed(2)}<br>
        Median Rating: ${dcMedianRating.toFixed(2)}<br>
    `;
  
    // remove any boundaries from prior calls of zoomIn()
    neighborhoodsLayer.resetStyle();
}

// changes infoBox summary for neighborhoods
function updateInfoBox(listingsData, neighborhoodDesignation) {
    // get the info box element
    const infoBoxElement = document.querySelector("#info-box");
    const neighborhoodListings = filterListingsByNeighborhood(listingsData, neighborhoodDesignation);

    if (!infoBoxElement) return;
  
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
    infoBoxChart(listingsData, neighborhoodDesignation, 'price');
  
    document.getElementById('infoBox-selector').addEventListener('change', (event) => {
        const selectedChart = event.target.value;
        infoBoxChart(listingsData, neighborhoodDesignation, selectedChart);
    });
}

// filter listings by neighborhood
function filterListingsByNeighborhood(listingsData, neighborhoodDesignation) {
    return listingsData.filter(listing => listing.neighbourhood === neighborhoodDesignation);
}

// calculate DC stats
function calculateDCStats(listingsData) {
    const prices = listingsData.map(listing => parseFloat(listing.price));
    const ratings = listingsData.filter(listing => listing.review_scores_rating !== null).map(listing => parseFloat(listing.review_scores_rating));

    return {
        dcMeanPrice: calculateMean(prices),
        dcMedianPrice: calculateMedian(prices),
        dcMeanRating: calculateMean(ratings),
        dcMedianRating: calculateMedian(ratings)
    };
}

// calculate neighborhood stats
function calculateNeighborhoodStats(neighborhoodListings) {
    const prices = neighborhoodListings.map(listing => parseFloat(listing.price));
    const ratings = neighborhoodListings.filter(listing => listing.review_scores_rating !== null).map(listing => parseFloat(listing.review_scores_rating));

    return {
        meanPrice: calculateMean(prices),
        medianPrice: calculateMedian(prices),
        meanRating: calculateMean(ratings),
        medianRating: calculateMedian(ratings)
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
    return sortedData.length % 2 === 0 ? (sortedData[mid - 1] + sortedData[mid]) / 2 : sortedData[mid];
}

// neighborhood vs. DC chart function
function infoBoxChart(listingsData, neighborhoodDesignation, chartType) {
    const dcStats = calculateDCStats(listingsData);
    const { dcMeanPrice, dcMedianPrice, dcMeanRating, dcMedianRating } = dcStats;

    const neighborhoodStats = calculateNeighborhoodStats(filterListingsByNeighborhood(listingsData, neighborhoodDesignation));
    const { meanPrice, medianPrice, meanRating, medianRating } = neighborhoodStats;

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

