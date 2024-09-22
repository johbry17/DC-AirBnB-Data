//resizePlots();
function resizePlots() {
  const plotIds = [
    "price-plot",
    "ratings-plot",
  ]

  plotIds.forEach((id) => {
    const container = document.getElementById(id);
    if (container) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Ensure dimensions are valid
      if (containerWidth > 0 && containerHeight > 0) {
        Plotly.relayout(container, {
          width: containerWidth,
          height: containerHeight,
        });
      }
    }
  });
}

// master function to call plots for all of DC
function allDCPlots(listingsData) {
  plotLocation(listingsData, "Washington, D.C.");
  plotLicenseBarChart(listingsData, "Washington, D.C.");
}

// master function to call plots for neighborhoods
function neighborhoodPlots(listingsData, selectedNeighborhood) {
  plotLocation(listingsData, selectedNeighborhood);
  plotLicenseBarChart(listingsData, selectedNeighborhood);
}

// conditional for data for all of DC or neighborhood
function plotLocation(listingsData, selectedNeighborhood) {
    const isDC = selectedNeighborhood === "Washington, D.C.";
    const dcStats = calculateStats(listingsData);

    let meanPrice, medianPrice, meanRating, medianRating;

    // get stats for DC, maybe for neighborhood
    if (!isDC) {
        const neighborhoodStats = calculateStats(filterListingsByNeighborhood(listingsData, selectedNeighborhood));
        ({ meanPrice, medianPrice, meanRating, medianRating } = neighborhoodStats);
    } else {
        ({ meanPrice, medianPrice, meanRating, medianRating } = dcStats);
    }

    // call update price and ratings plot
    updatePriceAndRatingsPlot("price", selectedNeighborhood, meanPrice, medianPrice, dcStats.meanPrice, dcStats.medianPrice);
    updatePriceAndRatingsPlot("ratings", selectedNeighborhood, meanRating, medianRating, dcStats.meanRating, dcStats.medianRating);
}

// plot of price and ratings for all of DC or a neighborhood
function updatePriceAndRatingsPlot(plotType, selectedNeighborhood, mean, median, dcMean, dcMedian) {
  // get container
  let plotContainer = document.querySelector(`#${plotType}-plot`);

  let chosenData, xLabels, yTitle;

  // conditional to set data and labels by plot type for all of DC and maybe neighborhood
  if (plotType === "price") {
    if (selectedNeighborhood === "Washington, D.C.") {
      chosenData = [dcMean, dcMedian].map(value => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
      xLabels = ["Mean (All of DC)", "Median (All of DC)"];
    } else {
      chosenData = [mean, median, dcMean, dcMedian].map(value => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
      xLabels = [
        "Mean (Neighborhood)",
        "Median (Neighborhood)",
        "Mean (All of DC)",
        "Median (All of DC)",
      ];
    }
    yTitle = "Price";
  } else if (plotType === "ratings") {
    if (selectedNeighborhood === "Washington, D.C.") {
      chosenData = [dcMean, dcMedian].map(value => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      xLabels = ["Mean (All of DC)", "Median (All of DC)"];
    } else {
      chosenData = [mean, median, dcMean, dcMedian].map(value => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      xLabels = [
        "Mean (Neighborhood)",
        "Median (Neighborhood)",
        "Mean (All of DC)",
        "Median (All of DC)",
      ];
    }
    yTitle = "Rating";
  }

  trace = {
    x: xLabels,
    y: chosenData,
    type: "bar",
    hovertemplate: plotType === "price" ? "%{y:$,.2f}<extra></extra>" : "%{y:.2f} \u2605<extra></extra>",
    text: plotType === "ratings" ?
      chosenData.map(value => value + " " + "\u2605") :
      chosenData,
    textposition: "auto",
    marker: {
      color:
        selectedNeighborhood === "Washington, D.C."
          ? ["blue", "blue"]
          : ["green", "green", "blue", "blue"],
      line: {
        color: "black",
        width: 1,
      },
    },
  };

  layout = {
    xaxis: { tickangle: 35 },
    yaxis: { title: yTitle },
    title:
      selectedNeighborhood === "Washington, D.C."
        ? `${yTitle} for Washington, D.C.`
        : `Neighborhood <b>vs.</b> all of DC<br><b>${yTitle}</b> Comparison`,
  };

  Plotly.newPlot(plotContainer, [trace], layout);
}

// plot license status and percentage
function plotLicenseBarChart(data, selectedNeighborhood) {
  // get container and set data
  const plotContainer = document.getElementById('license-plot');
  const categorizedDCData = setLicenseStatus(data);
  const licensePercentageDC = getLicensePercentage(categorizedDCData);

  let percents, counts, xLabels, title, markerColors;

  // conditional to set data and labels for all of DC, maybe neighborhood
  if (selectedNeighborhood === "Washington, D.C.") {
    percents = [
      licensePercentageDC['Licensed'].percent,
      licensePercentageDC['Exempt'].percent,
      licensePercentageDC['Unlicensed'].percent,
    ];
    counts = [
      licensePercentageDC['Licensed'].count,
      licensePercentageDC['Exempt'].count,
      licensePercentageDC['Unlicensed'].count,
    ];
    xLabels = ['Licensed', 'Exempt', 'Unlicensed'];
    title = "License Status for Washington, D.C.";
    markerColors = ['darkgray', 'lightgray', 'blue'];
  } else {
    const neighborhoodData = filterListingsByNeighborhood(data, selectedNeighborhood);
    const categorizedNeighborhoodData = setLicenseStatus(neighborhoodData);
    const licensePercentageNeighborhood = getLicensePercentage(categorizedNeighborhoodData);

    percents = [
      licensePercentageNeighborhood['Licensed'].percent,
      licensePercentageNeighborhood['Exempt'].percent,
      licensePercentageNeighborhood['Unlicensed'].percent,
      licensePercentageDC['Licensed'].percent,
      licensePercentageDC['Exempt'].percent,
      licensePercentageDC['Unlicensed'].percent,
    ];
    counts = [
      licensePercentageNeighborhood['Licensed'].count,
      licensePercentageNeighborhood['Exempt'].count,
      licensePercentageNeighborhood['Unlicensed'].count,
      licensePercentageDC['Licensed'].count,
      licensePercentageDC['Exempt'].count,
      licensePercentageDC['Unlicensed'].count,
    ];
    xLabels = [
      'Licensed (Neighborhood)',
      'Exempt (Neighborhood)',
      'Unlicensed (Neighborhood)',
      'Licensed (All of DC)',
      'Exempt (All of DC)',
      'Unlicensed (All of DC)',
    ];
    title = `Neighborhood <b>vs.</b> Washington, D.C.<br><b>License Status</b> Comparison`;
    markerColors = ['darkgray', 'lightgray', 'green', 'darkgray', 'lightgray', 'blue'];
  }

  const trace = {
    x: xLabels,
    y: percents,
    type: 'bar',
    text: percents.map(percent => percent + "%"),
    textposition: 'auto',
    hovertemplate: counts.map((count, index) => 
      `Percent: <b>${percents[index]}%</b><br>Count: <b>${count.toLocaleString()}</b><br><extra></extra>`
    ),
    marker: {
      color: markerColors,
      line: { color: 'black', width: 1 },
    },
  };

  const layout = {
    yaxis: { title: "License Status" },
    xaxis: { title: "Percentage" },
    title: title,
  };

  // const annotations = xLabels.map((label, index) => ({
  //   x: label,
  //   y: -0.05, // Position below the x-axis
  //   xref: 'x',
  //   yref: 'paper',
  //   text: label,
  //   showarrow: false,
  //   font: {
  //     color: markerColors[index],
  //   },
  // }));

  // const layout = {
  //   yaxis: { title: "License Status" },
  //   xaxis: { title: "Percentage" },
  //   title: title,
  //   annotations: annotations,
  // };


  Plotly.newPlot(plotContainer, [trace], layout);
}
