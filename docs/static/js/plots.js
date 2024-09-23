//resizePlots();
function resizePlots() {
  const plotIds = [
    "price-plot",
    "ratings-plot",
    "license-plot",
    "property-type-plot",
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

  let chosenData, xLabels, yTitle, hoverText;

  // conditional to assign data and labels, by plot type, for all of DC and maybe neighborhood
  if (plotType === "price") {
    if (selectedNeighborhood === "Washington, D.C.") {
      // format data and labels
      chosenData = [dcMean, dcMedian];
      hoverText = chosenData.map(value => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
      xLabels = ["Mean (<b>$</b>)", "Median (<b>$</b>)"];
    } else {
      // format data and labels
      chosenData = [mean, median, dcMean, dcMedian];
      hoverText = chosenData.map(value => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
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
      // format data and labels
      chosenData = [dcMean, dcMedian];
      hoverText = chosenData.map(value => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u2605");
      xLabels = ["Mean (\u2605)", "Median (\u2605)"];
    } else {
      // format data and labels
      chosenData = [mean, median, dcMean, dcMedian];
      hoverText = chosenData.map(value => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u2605");
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
    hovertemplate: plotType === "price" ? "%{text}<extra></extra>" : "%{text}<extra></extra>",
    text: hoverText,
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
  // get container and percentage data, total count for all of DC
  const plotContainer = document.getElementById('license-plot');
  const categorizedDCData = setLicenseStatus(data);
  const licensePercentageDC = getLicensePercentage(categorizedDCData);
  const totalDCCount = Object.values(licensePercentageDC).reduce((acc, obj) => acc + obj.count, 0);

  let percents, counts, xLabels, title, markerColors, customdata;

  // conditional to set data and labels for all of DC, maybe neighborhood
  if (selectedNeighborhood === "Washington, D.C.") {
    // assign variables
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
    title = `<b>License Status</b> for Washington, D.C.<br><i style="font-size: .8em;">Licensed highlighted in color</i>`;
    markerColors = ['blue', 'lightblue', 'darkgray'];
    customdata = counts.map(count => ({ count: count.toLocaleString(), total: totalDCCount.toLocaleString() }));
  } else {
    // get perecentage data, total count for neighborhood
    const neighborhoodData = filterListingsByNeighborhood(data, selectedNeighborhood);
    const categorizedNeighborhoodData = setLicenseStatus(neighborhoodData);
    const licensePercentageNeighborhood = getLicensePercentage(categorizedNeighborhoodData);
    totalNeighborhoodCount = Object.values(licensePercentageNeighborhood).reduce((acc, obj) => acc + obj.count, 0);

    // assign variables
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
    title = `Neighborhood <b>vs.</b> Washington, D.C.<br><b>License Status</b> Comparison<br><i style="font-size: .8em;">Licensed highlighted in color</i>`;
    markerColors = ['green', 'lightgreen', 'darkgray', 'blue', 'lightblue', 'darkgray'];
    customdata = [
      ...counts.slice(0, 3).map(count => ({ count: count.toLocaleString(), total: totalNeighborhoodCount.toLocaleString() })),
      ...counts.slice(3).map(count => ({ count: count.toLocaleString(), total: totalDCCount.toLocaleString() })),
    ];
  }

  const trace = {
    x: xLabels,
    y: percents,
    type: 'bar',
    text: percents.map(percent => percent + "%"),
    textposition: 'auto',
    hovertemplate: `Percent: <b>%{y}%</b><br>Count: <b>%{customdata.count}</b> of %{customdata.total}<br><extra></extra>`,
    customdata: customdata,
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
    },
    {
      x: [null],
      y: [null],
      type: 'bar',
      marker: { color: 'darkgray' },
      name: 'Unlicensed',
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

  // run calculations for property type percentage, total count for all of DC
  const dcPropertyTypes = getPropertyTypePercentage(data);
  const neighborhoodPropertyTypes = getPropertyTypePercentage(neighborhoodData);
  const totalDCCount = Object.values(dcPropertyTypes).reduce((acc, obj) => acc + obj.count, 0);

  // declare variables
  let percents, counts, xLabels, title, markerColors, customdata;

  // conditional to set data and labels for all of DC, maybe neighborhood
  if (selectedNeighborhood === "Washington, D.C.") {
    // combine DC data
    let combinedData = Object.keys(dcPropertyTypes).map(key => ({
      label: key,
      percent: dcPropertyTypes[key].percent,
      count: dcPropertyTypes[key].count
    }));

    // sort by descending percentage
    combinedData.sort((a, b) => b.percent - a.percent);

    // assign variables
    percents = combinedData.map(item => item.percent);
    counts = combinedData.map(item => item.count);
    xLabels = combinedData.map(item => item.label);
    title = `<b>Property Type</b> for Washington, D.C.<br><i style="font-size: .8em;">Percent of Available AirBnB's</i>`;
    markerColors = combinedData.map(item => 'blue');
    customdata = counts.map(count => ({ count: count.toLocaleString(), total: totalDCCount.toLocaleString() }));
  } else {
    // get total count for neighborhood
    const totalNeighborhoodCount = Object.values(neighborhoodPropertyTypes).reduce((acc, obj) => acc + obj.count, 0);

    // combine neighborhood and DC data
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

    // sort by descending percentage
    combinedData.sort((a, b) => b.percent - a.percent);

    // assign variables
    percents = combinedData.map(item => item.percent);
    counts = combinedData.map(item => item.count);
    xLabels = combinedData.map(item => item.label);
    markerColors = combinedData.map(item => item.label.includes("Neighborhood") ? 'green' : 'blue');
    title = `Neighborhood <b>vs.</b> Washington, D.C.<br><b>Property Type</b> Comparison<br><i style="font-size: .8em;">Percent of Available AirBnB's in Area</i>`;
    customdata = combinedData.map(item => ({
      count: item.count.toLocaleString(),
      total: item.label.includes("Neighborhood") ? totalNeighborhoodCount.toLocaleString() : totalDCCount.toLocaleString()
    }));
  }

  const trace = {
    x: xLabels,
    y: percents,
    type: 'bar',
    text: percents.map(percent => percent + "%"),
    textposition: 'auto',
    hovertemplate: 'Percent: <b>%{y}%</b><br>Count: <b>%{customdata.count}</b> of %{customdata.total}<br><extra></extra>',
    customdata: customdata,
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

