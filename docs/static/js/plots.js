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
  plotPropertyType(listingsData, "Washington, D.C.");
}

// master function to call plots for neighborhoods
function neighborhoodPlots(listingsData, selectedNeighborhood) {
  plotLocation(listingsData, selectedNeighborhood);
  plotLicenseBarChart(listingsData, selectedNeighborhood);
  plotPropertyType(listingsData, selectedNeighborhood);
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
      xLabels = ["Mean (<b>$</b>)", "Median (<b>$</b>)"];
    } else {
      chosenData = [mean, median, dcMean, dcMedian].map(value => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
      xLabels = [
        "Mean (<b>$</b>) (Neighborhood)",
        "Median (<b>$</b>) (Neighborhood)",
        "Mean (<b>$</b>) (All of DC)",
        "Median (<b>$</b>) (All of DC)",
      ];
    }
    yTitle = "Price";
  } else if (plotType === "ratings") {
    if (selectedNeighborhood === "Washington, D.C.") {
      chosenData = [dcMean, dcMedian].map(value => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      xLabels = ["Mean (\u2605)", "Median (\u2605)"];
    } else {
      chosenData = [mean, median, dcMean, dcMedian].map(value => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      xLabels = [
        "Mean (\u2605) (Neighborhood)",
        "Median (\u2605) (Neighborhood)",
        "Mean (\u2605) (All of DC)",
        "Median (\u2605) (All of DC)",
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
    // xaxis: { tickangle: 35 },
    yaxis: { title: yTitle === "Price" ? "Price ($)" : "Rating (\u2605)" },
    title:
      selectedNeighborhood === "Washington, D.C."
        ? `<b>${yTitle}</b> for Washington, D.C.<br><i style="font-size: .8em;">Mean and Median</i>`
        : `Neighborhood <b>vs.</b> all of DC<br><b>${yTitle}</b> Comparison<br><i style="font-size: .8em;">Mean and Median</i>`,
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
    title = `<b>License Status</b> for Washington, D.C.<br><i style="font-size: .8em;">Unlicensed highlighted in color</i>`;
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
    title = `Neighborhood <b>vs.</b> Washington, D.C.<br><b>License Status</b> Comparison<br><i style="font-size: .8em;">Unlicensed highlighted in color</i>`;
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
    showlegend: false, // hide legend for the main trace
  };

  // show legend only if a neighborhood is selected
  const showLegend = selectedNeighborhood !== "Washington, D.C."; 

  // add dummy traces for the legend
  const legendTraces = [
    {
      x: [null],
      y: [null],
      type: 'bar',
      marker: { color: 'green' },
      name: 'Neighborhood',
      showlegend: showLegend,
    },
    {
      x: [null],
      y: [null],
      type: 'bar',
      marker: { color: 'blue' },
      name: 'DC',
      showlegend: showLegend,
    }
  ];

  const layout = {
    yaxis: { title: "Percent (%) of Total" },
    // xaxis: { title: "License Status" },
    title: title,
    legend: {
      orientation: 'h',
      y: -0.3,
      x: 0.5,
      xanchor: 'center',
      yanchor: 'top'
    }
  };

  Plotly.newPlot(plotContainer, [trace, ...legendTraces], layout);
}

// plot of property type percentage
function plotPropertyType(data, selectedNeighborhood) {
  // get container and set data
  const plotContainer = document.getElementById('property-type-plot');
  const neighborhoodData = filterListingsByNeighborhood(data, selectedNeighborhood);

  // run calculations for property type percentage
  const dcPropertyTypes = getPropertyTypePercentage(data);
  const neighborhoodPropertyTypes = getPropertyTypePercentage(neighborhoodData);

  // declare variables
  let percents, counts, xLabels, title, markerColors;

  // conditional to set data and labels for all of DC, maybe neighborhood
  if (selectedNeighborhood === "Washington, D.C.") {
    let combinedData = Object.keys(dcPropertyTypes).map(key => ({
      label: key,
      percent: dcPropertyTypes[key].percent,
      count: dcPropertyTypes[key].count
    }));

    // Sort by descending percentage
    combinedData.sort((a, b) => b.percent - a.percent);

    percents = combinedData.map(item => item.percent);
    counts = combinedData.map(item => item.count);
    xLabels = combinedData.map(item => item.label);
    title = `<b>Property Type</b> for Washington, D.C.<br><i style="font-size: .8em;">Percent of Available AirBnB's</i>`;
    markerColors = combinedData.map(item => 'blue');
  } else {
    let combinedData = [
      ...Object.keys(neighborhoodPropertyTypes).map(key => ({
        label: `${key} (Neighborhood)`,
        percent: neighborhoodPropertyTypes[key].percent,
        count: neighborhoodPropertyTypes[key].count
      })),
      ...Object.keys(dcPropertyTypes).map(key => ({
        label: `${key} (All of DC)`,
        percent: dcPropertyTypes[key].percent,
        count: dcPropertyTypes[key].count
      }))
    ];

    // Sort by descending percentage
    combinedData.sort((a, b) => b.percent - a.percent);

    percents = combinedData.map(item => item.percent);
    counts = combinedData.map(item => item.count);
    xLabels = combinedData.map(item => item.label);
    markerColors = combinedData.map(item => item.label.includes("Neighborhood") ? 'green' : 'blue');
    title = `Neighborhood <b>vs.</b> Washington, D.C.<br><b>Property Type</b> Comparison<br><i style="font-size: .8em;">Percent of Available AirBnB's in Area</i>`;
  }

  const trace = {
    x: xLabels,
    y: percents,
    type: 'bar',
    text: percents.map(percent => percent + "%"),
    textposition: 'auto',
    hovertemplate: 'Percent: <b>%{y}%</b><br>Count: <b>%{customdata}</b><br><extra></extra>',
    customdata: counts.map(count => count.toLocaleString()),
    marker: {
      color: markerColors,
      line: { color: 'black', width: 1 },
    },
    showlegend: false, // hide legend for the main trace
  };

  // show legend only if a neighborhood is selected
  const showLegend = selectedNeighborhood !== "Washington, D.C."; 

  // add dummy traces for the legend
  const legendTraces = [
    {
      x: [null],
      y: [null],
      type: 'bar',
      marker: { color: 'green' },
      name: 'Neighborhood',
      showlegend: showLegend,
    },
    {
      x: [null],
      y: [null],
      type: 'bar',
      marker: { color: 'blue' },
      name: 'DC',
      showlegend: showLegend,
    }
  ];

  const layout = {
    yaxis: { title: "Percent (%) of Total" },
    xaxis: { 
      // title: "Property Type" ,
      tickangle: 35,
    },
    title: title,
    legend: {
      orientation: 'h',
      y: -0.3,
      x: 0.5,
      xanchor: 'center',
      yanchor: 'top'
    }
  };


  Plotly.newPlot(plotContainer, [trace, ...legendTraces], layout);
}