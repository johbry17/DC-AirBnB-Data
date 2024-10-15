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
        return { ...item, licenseCategory: "No License" };
    }
  });
}

// aggregate by category, get percent of total for each license category
function getLicensePercentage(data) {
  let total = data.length;
  let distribution = {
    Licensed: 0,
    Exempt: 0,
    "No License": 0,
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

// calculate average price per license category
function getAveragePriceByLicense(data) {
  let totalCount = {
    Licensed: 0,
    Exempt: 0,
    "No License": 0,
  };

  let totalSum = {
    Licensed: 0,
    Exempt: 0,
    "No License": 0,
  };

  // aggregate price and count by category
  data.forEach((item) => {
    let price = parseFloat(item.price) || 0; // Ensure price is a valid number
    totalSum[item.licenseCategory] += price;
    if (price > 0) {
      totalCount[item.licenseCategory]++;
    }
  });

  // calculate average price for each category
  let averagePriceDistribution = {};
  for (let key in totalSum) {
    averagePriceDistribution[key] = {
      count: totalCount[key],
      avgPrice:
        totalCount[key] > 0 ? (totalSum[key] / totalCount[key]).toFixed(2) : 0,
    };
  }

  return averagePriceDistribution;
}

// calculate average price per room_type
function getPropertyTypePrice(data) {
  let totalSum = {};
  let totalCount = {};

  // aggregate price and count by room_type
  data.forEach((item) => {
    let price = parseFloat(item.price) || 0;
    totalSum[item.room_type] = totalSum[item.room_type]
      ? totalSum[item.room_type] + price
      : price;
    totalCount[item.room_type] = totalCount[item.room_type]
      ? totalCount[item.room_type] + 1
      : 1;
  });

  // calculate average price for each room_type
  let averagePriceDistribution = {};
  for (let key in totalSum) {
    averagePriceDistribution[key] = {
      count: totalCount[key],
      avgPrice:
        totalCount[key] > 0 ? (totalSum[key] / totalCount[key]).toFixed(2) : 0,
    };
  }

  return averagePriceDistribution;
}

// calculate number of listings per minimum nights required for booking <= 32
function getMinimumNights(data) {
  let distribution = {};

  // filter out listings with minimum_nights > 32
  data = data.filter((item) => item.minimum_nights <= 32);

  // count for each minimum_nights bin
  data.forEach((item) => {
    distribution[item.minimum_nights] = distribution[item.minimum_nights]
      ? distribution[item.minimum_nights] + 1
      : 1;
  });

  return distribution;
}

// calculate number of airbnbs per host, binned by number of listings, with 10+ listings as one bin
function getHostAirbnbs(data) {
  let hostCounts = {};
  let distribution = {};

  // count the number of listings per host
  data.forEach((item) => {
    hostCounts[item.host_id] = hostCounts[item.host_id] ? hostCounts[item.host_id] + 1 : 1;
  });

  // create bins for number of listings
  const labels = [...Array(10).keys()].map(String).concat(["10+"]);

  // initialize distribution with labels
  labels.forEach(label => distribution[label] = 0);

  // bin the hosts based on the number of listings and sum counts
  Object.values(hostCounts).forEach((count) => {
    let bin = count >= 10 ? "10+" : String(count);
    distribution[bin] += count;
  });

  return distribution;
}

// get top 20 hosts with the most listings
function getTopHosts(data) {
  let hostCounts = {};

  // count the number of listings per host and include host_name
  data.forEach((item) => {
    if (hostCounts[item.host_id]) {
      hostCounts[item.host_id].count += 1;
    } else {
      hostCounts[item.host_id] = { name: item.host_name, count: 1 };
    }
  });

  // sort the hosts by number of listings
  const sortedHosts = Object.entries(hostCounts).sort((a, b) => b[1].count - a[1].count);

  // get the top 20 hosts
  return sortedHosts.slice(0, 20).map(([host_id, { name, count }]) => ({ host_id, host_name: name, count }));
}