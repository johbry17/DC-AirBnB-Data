// set default color scheme
let defaultColors = {
  defaultGray: "#6c757d",
  neighborhoodColor: "#198754",
  neighborhoodColorLight: "lightgreen",
  cityColor: "blue",
  cityColorLight: "lightblue",
};

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

// label each license status
function setLicenseStatus(data) {
  return data.map((item) => {
    let license = item.license
      ? item.license.split(":")[0].trim()
      : "No License";
    switch (license.toLowerCase()) {
      case "hosted license":
      case "unhosted license":
        return { ...item, licenseCategory: "Licensed" };
      case "exempt":
        return { ...item, licenseCategory: "Exempt" };
      default:
        return { ...item, licenseCategory: "Unlicensed" };
    }
  });
}

// aggregate by category, get percent of total for each license category
function getLicensePercentage(data) {
  let total = data.length;
  let distribution = {
    Licensed: 0,
    Exempt: 0,
    Unlicensed: 0,
  };

  // aggregate each category
  data.forEach((item) => {
    distribution[item.licenseCategory]++;
  });

  // add percentage to each category
  let percentageDistribution = {};
  for (let key in distribution) {
    percentageDistribution[key] = {
      count: distribution[key],
      percent: ((distribution[key] / total) * 100).toFixed(1),
    };
  }

  return percentageDistribution;
}

// calculate total and percentage for each room_type
function getPropertyTypePercentage(data) {
  let total = data.length;
  let distribution = {};

  // count each room_type
  data.forEach((item) => {
    let roomType = item.room_type;
    distribution[roomType] = distribution[roomType]
      ? distribution[roomType] + 1
      : 1;
  });

  // add percentage to each room_type
  let percentageDistribution = {};
  for (let key in distribution) {
    percentageDistribution[key] = {
      count: distribution[key],
      percent: ((distribution[key] / total) * 100).toFixed(1),
    };
  }

  return percentageDistribution;
}
