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

// set license status
function setLicenseStatus(data) {
    return data.map(item => {
        let license = item.license ? item.license.split(':')[0].trim() : 'No License';
        switch (license.toLowerCase()) {
            case 'hosted license':
            case 'unhosted license':
                return { ...item, licenseCategory: 'Licensed' };
            case 'exempt':
                return { ...item, licenseCategory: 'Exempt' };
            default:
                return { ...item, licenseCategory: 'Unlicensed' };
        }
    });
}

function getLicensePercentage(data) {
    let total = data.length;
    let distribution = {
        Licensed: 0,
        Exempt: 0,
        Unlicensed: 0
    };

    data.forEach(item => {
        distribution[item.licenseCategory]++;
    });

    // Add percentage to each category
    let percentageDistribution = {};
    for (let key in distribution) {
        percentageDistribution[key] = {
            count: distribution[key],
            percent: ((distribution[key] / total) * 100).toFixed(1)
        };
    }

    return percentageDistribution;
}