//resizePlots();
function resizePlots() {
  const plotIds = [
    "price-availability-plot",
    "price-plot",
    "ratings-plot",
    "license-plot",
    "property-type-plot",
  ];

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
function allDCPlots(listingsData, priceAvailabilityData, colors) {
  plotPriceAvailability(priceAvailabilityData, "Washington, D.C.");
  updatePricePlot(listingsData, "Washington, D.C.", colors);
  updateRatingsPlot(listingsData, "Washington, D.C.", colors);
  plotLicenseDonut(listingsData, "Washington, D.C.", colors);
  plotPropertyType(listingsData, "Washington, D.C.", colors);
}

// master function to call plots for neighborhoods
function neighborhoodPlots(
  listingsData,
  selectedNeighborhood,
  priceAvailabilityData,
  colors
) {
  plotPriceAvailability(priceAvailabilityData, selectedNeighborhood);
  updatePricePlot(listingsData, selectedNeighborhood, colors);
  updateRatingsPlot(listingsData, selectedNeighborhood, colors);
  plotLicenseDonut(listingsData, selectedNeighborhood, colors);
  plotPropertyType(listingsData, selectedNeighborhood, colors);
}

// traces for each plot
function getLegendTraces(colors, selectedNeighborhood) {
  const showLegend = selectedNeighborhood !== "Washington, D.C.";
  return [
    {
      x: [null],
      y: [null],
      type: "bar",
      orientation: "h",
      marker: { color: colors.neighborhoodColor },
      name: "Neighborhood",
      showlegend: showLegend,
    },
    {
      x: [null],
      y: [null],
      type: "bar",
      marker: { color: colors.cityColor },
      name: "DC",
      showlegend: showLegend,
    },
  ];
}

// plot price and availability for all of DC or a neighborhood
function plotPriceAvailability(data, selectedNeighborhood) {
  // data for all of DC
  const allDCData = data.filter((d) => d.neighbourhood === ""); // Filter for overall Washington, D.C.
  const allDates = allDCData.map((d) => d.date);
  const allAvgPrices = allDCData.map((d) => +d.avg_price);
  const allAvailableListings = allDCData.map((d) => +d.available_listings);

  // data for neighborhood
  const neighborhoodData = data.filter(
    (d) => d.neighbourhood === selectedNeighborhood
  );
  const neighborhoodDates = neighborhoodData.map((d) => d.date);
  const neighborhoodAvgPrices = neighborhoodData.map((d) => +d.avg_price);
  const neighborhoodAvailableListings = neighborhoodData.map(
    (d) => +d.available_listings
  );

  // select data based on selectedNeighborhood
  const dates =
    selectedNeighborhood === "Washington, D.C." ? allDates : neighborhoodDates;
  const avgPrices =
    selectedNeighborhood === "Washington, D.C."
      ? allAvgPrices
      : neighborhoodAvgPrices;
  const availableListings =
    selectedNeighborhood === "Washington, D.C."
      ? allAvailableListings
      : neighborhoodAvailableListings;

  // create traces (one line for each metric)
  const trace1 = {
    x: dates,
    y: avgPrices,
    mode: "lines",
    name: "Avg Price (≤ $500)",
    line: { color: "orange" },
    hovertemplate: "<b>Price:</b> %{text}<extra></extra>",
    text: avgPrices.map(
      (price) =>
        `$${price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
    ),
  };
  const trace2 = {
    x: dates,
    y: availableListings,
    mode: "lines",
    name: "Availability",
    line: { color: "blue" },
    yaxis: "y2",
    hovertemplate: "<b>Availability:</b> %{text}<extra></extra>",
    text: availableListings.map((listing) => `${listing.toLocaleString()}`),
  };

  const layout = {
    title: `Price and Availability Over Time<br>(${selectedNeighborhood})<br><i style='font-size: .8em;'>Hover for details, excludes Airbnb's ≥ $500/night</i>`,
    xaxis: { title: "Date" },
    yaxis: {
      title: "Avg Price (≤ $500)",
      titlefont: { color: "orange" },
      tickfont: { color: "orange" },
    },
    yaxis2: {
      title: "Availability",
      titlefont: { color: "blue" },
      tickfont: { color: "blue" },
      overlaying: "y",
      side: "right",
    },
    hovermode: "x unified",
    legend: {
      orientation: "h",
      y: -0.3,
      x: 0.5,
      xanchor: "center",
      yanchor: "top",
    },
  };

  // plot single neighborhood or DC-wide traces
  Plotly.newPlot("price-availability-plot", [trace1, trace2], layout);
}

function updatePricePlot(listingsData, selectedNeighborhood, colors) {
  // calculate price stats for DC and neighborhood
  const dcStats = calculateStats(listingsData);
  const isDC = selectedNeighborhood === "Washington, D.C.";
  const filteredListings = isDC
    ? listingsData
    : filterListingsByNeighborhood(listingsData, selectedNeighborhood);
  const neighborhoodStats = calculateStats(filteredListings);

  // get container
  let plotContainer = document.querySelector("#price-plot");

  // format data and labels
  let chosenData = isDC
    ? [dcStats.meanPrice, dcStats.medianPrice]
    : [
        neighborhoodStats.meanPrice,
        neighborhoodStats.medianPrice,
        dcStats.meanPrice,
        dcStats.medianPrice,
      ];
  let hoverText = chosenData.map((value) =>
    value.toLocaleString("en-US", { style: "currency", currency: "USD" })
  );
  let xLabels =
    selectedNeighborhood === isDC
      ? ["Mean (<b>$</b>)", "Median (<b>$</b>)"]
      : [
          "Mean (<b>$</b>)<br>(Neighborhood)",
          "Median (<b>$</b>)<br>(Neighborhood)",
          "Mean (<b>$</b>)<br>(All of DC)",
          "Median (<b>$</b>)<br>(All of DC)",
        ];

  // create trace
  let trace = {
    x: xLabels,
    y: chosenData,
    type: "bar",
    hovertemplate: "%{text}<extra></extra>",
    text: hoverText,
    textposition: "auto",
    marker: {
      color:
        selectedNeighborhood === "Washington, D.C."
          ? [colors.cityColor, colors.cityColor]
          : [
              colors.neighborhoodColor,
              colors.neighborhoodColor,
              colors.cityColor,
              colors.cityColor,
            ],
      line: { color: "black", width: 1 },
    },
    showlegend: false,
  };

  // get legend traces
  const legendTraces = getLegendTraces(colors, selectedNeighborhood);

  // create layout
  let layout = {
    yaxis: { title: "Price ($)" },
    title:
      selectedNeighborhood === "Washington, D.C."
        ? `<b>Price</b> for Washington, D.C.<br><i style="font-size: .8em;">Mean and Median</i>`
        : `Neighborhood <b>vs.</b> all of DC<br><b>Price</b> Comparison<br><i style="font-size: .8em;">Mean and Median</i>`,
    legend: {
      orientation: "h",
      y: -0.3,
      x: 0.5,
      xanchor: "center",
      yanchor: "top",
    },
  };

  Plotly.newPlot(plotContainer, [trace, ...legendTraces], layout);
}

function updateRatingsPlot(listingsData, selectedNeighborhood, colors) {
  // calculate rating stats for DC and neighborhood
  const dcStats = calculateStats(listingsData);
  const isDC = selectedNeighborhood === "Washington, D.C.";
  const filteredListings = isDC
    ? listingsData
    : filterListingsByNeighborhood(listingsData, selectedNeighborhood);
  const neighborhoodStats = calculateStats(filteredListings);

  // get container
  let plotContainer = document.querySelector("#ratings-plot");

  // format data and labels
  let chosenData = isDC
    ? [dcStats.meanRating, dcStats.medianRating]
    : [
        neighborhoodStats.meanRating,
        neighborhoodStats.medianRating,
        dcStats.meanRating,
        dcStats.medianRating,
      ];
  let hoverText = chosenData.map(
    (value) =>
      value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " \u2605"
  );
  let xLabels = isDC
    ? ["Mean (\u2605)", "Median (\u2605)"]
    : [
        "Mean (\u2605)<br>(Neighborhood)",
        "Median (\u2605)<br>(Neighborhood)",
        "Mean (\u2605)<br>(All of DC)",
        "Median (\u2605)<br>(All of DC)",
      ];

  // create trace
  let trace = {
    x: xLabels,
    y: chosenData,
    type: "bar",
    hovertemplate: "%{text}<extra></extra>",
    text: hoverText,
    textposition: "auto",
    marker: {
      color:
        selectedNeighborhood === "Washington, D.C."
          ? [colors.cityColor, colors.cityColor]
          : [
              colors.neighborhoodColor,
              colors.neighborhoodColor,
              colors.cityColor,
              colors.cityColor,
            ],
      line: { color: "black", width: 1 },
    },
    showlegend: false,
  };

  // get legend traces
  const legendTraces = getLegendTraces(colors, selectedNeighborhood);

  // create layout
  let layout = {
    yaxis: {
      title: "Rating (\u2605)",
      range: [4, Math.max(...chosenData) + 1],
    },
    title:
      selectedNeighborhood === "Washington, D.C."
        ? `<b>Ratings</b> for Washington, D.C.<br><i style="font-size: .8em;">N.B., y-axis <b>deceptively</b> starts at 4</i>`
        : `Neighborhood <b>vs.</b> all of DC<br><b>Ratings</b> Comparison<br><i style="font-size: .8em;">N.B., y-axis <b>deceptively</b> starts at 4</i>`,
    legend: {
      orientation: "h",
      y: -0.3,
      x: 0.5,
      xanchor: "center",
      yanchor: "top",
    },
  };

  Plotly.newPlot(plotContainer, [trace, ...legendTraces], layout);
}

// plot license status and percentage
function plotLicenseDonut(data, selectedNeighborhood, colors) {
  // get container and calculate DC data
  const plotContainer = document.getElementById("license-plot");
  const categorizedDCData = setLicenseStatus(data);
  const licensePercentageDC = getLicensePercentage(categorizedDCData);

  // declare variables
  let neighborhoodValues, neighborhoodLabels, neighborhoodColors;
  let dcValues, dcLabels, dcTitle, dcColors;

  // assign DC data to variables
  dcLabels = ["Licensed", "Exempt", "No License"];
  dcValues = [
    licensePercentageDC["Licensed"].percent,
    licensePercentageDC["Exempt"].percent,
    licensePercentageDC["No License"].percent,
  ];
  dcTitle = `Washington, D.C. <b>License Status</b><br><i style="font-size: .8em;">Short term rentals (STR's) are 30 nights or less<br>'Licensed' is hosted or unhosted STR's<br>Long term stays, hotels, motels can claim 'Exempt'</i>`;
  dcColors = [colors.cityColor, colors.cityColorLight, colors.defaultGray];

  // conditional for DC only or neighborhood and DC
  if (selectedNeighborhood === "Washington, D.C.") {
    // single donut for DC only
    const dcTrace = {
      labels: dcLabels,
      values: dcValues,
      type: "pie",
      hole: 0.4,
      marker: { colors: dcColors },
      hoverinfo: "label+percent",
      textinfo: "label+percent",
    };

    const layout = {
      title: dcTitle,
      showlegend: true,
      // mostly to space from top (title)
      margin: {
        l: 50,
        r: 50,
        t: 200,
        pad: 4,
      },
      legend: {
        orientation: "h",
        y: -0.3,
        x: 0.5,
        xanchor: "center",
        yanchor: "top",
      },
    };

    // plot DC only
    Plotly.newPlot(plotContainer, [dcTrace], layout);
  } else {
    // else Neighborhood and DC license status donuts
    // get neighborhood data
    const neighborhoodData = filterListingsByNeighborhood(
      data,
      selectedNeighborhood
    );
    const categorizedNeighborhoodData = setLicenseStatus(neighborhoodData);
    const licensePercentageNeighborhood = getLicensePercentage(
      categorizedNeighborhoodData
    );

    // assign neighborhood data to variables
    neighborhoodLabels = ["Licensed", "Exempt", "No License"];
    neighborhoodValues = [
      licensePercentageNeighborhood["Licensed"].percent,
      licensePercentageNeighborhood["Exempt"].percent,
      licensePercentageNeighborhood["No License"].percent,
    ];
    neighborhoodColors = [
      colors.neighborhoodColor,
      colors.neighborhoodColorLight,
      colors.defaultGray,
    ];

    // two donut charts: one for Neighborhood, one for DC
    const neighborhoodTrace = {
      labels: neighborhoodLabels,
      values: neighborhoodValues,
      type: "pie",
      hole: 0.4,
      marker: { colors: neighborhoodColors },
      hoverinfo: "label+percent",
      textinfo: "label+percent",
      domain: { row: 0, column: 0 },
      showlegend: false,
    };

    const dcTrace = {
      labels: dcLabels,
      values: dcValues,
      type: "pie",
      hole: 0.4,
      marker: { colors: dcColors },
      hoverinfo: "label+percent",
      textinfo: "label+percent",
      domain: { row: 0, column: 1 },
      showlegend: false,
    };

    // dummy traces for the legend
    const legendTraces = [
      {
        x: [null],
        y: [null],
        type: "bar",
        marker: { color: colors.neighborhoodColor },
        name: "Neighborhood",
        showlegend: true,
      },
      {
        x: [null],
        y: [null],
        type: "bar",
        marker: { color: colors.cityColor },
        name: "DC",
        showlegend: true,
      },
      {
        x: [null],
        y: [null],
        type: "bar",
        marker: { color: colors.defaultGray },
        name: "No License",
        showlegend: true,
      },
    ];

    const layout = {
      title: `<b>License Status</b> Comparison:<br>Neighborhood <b>vs.</b> Washington, D.C.<br><i style="font-size: .8em;">Short term rentals (STR's) are 30 nights or less<br>'Licensed' is hosted or unhosted STR's<br>Long term stays, hotels, motels can claim 'Exempt'</i>`,
      grid: { rows: 1, columns: 2 },
      legend: {
        orientation: "h",
        y: -0.3,
        x: 0.5,
        xanchor: "center",
        yanchor: "top",
      },
      // mostly to space from top (title)
      margin: {
        l: 50,
        r: 50,
        t: 200,
        pad: 4,
      },
      // it was showing gridlines for some reason
      xaxis: {
        showgrid: false,
        zeroline: false,
        showticklabels: false,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        showticklabels: false,
      },
    };

    Plotly.newPlot(
      plotContainer,
      [neighborhoodTrace, dcTrace, ...legendTraces],
      layout
    );
  }
}

// plot of property type percentage
function plotPropertyType(data, selectedNeighborhood, colors) {
  // get container and set data
  const plotContainer = document.getElementById("property-type-plot");
  const neighborhoodData = filterListingsByNeighborhood(
    data,
    selectedNeighborhood
  );

  // run calculations for property type percentage, total count for all of DC
  const dcPropertyTypes = getPropertyTypePercentage(data);
  const neighborhoodPropertyTypes = getPropertyTypePercentage(neighborhoodData);
  const totalDCCount = Object.values(dcPropertyTypes).reduce(
    (acc, obj) => acc + obj.count,
    0
  );

  // declare variables
  let percents, counts, xLabels, title, markerColors, customdata;

  // conditional to set data and labels for all of DC, maybe neighborhood
  if (selectedNeighborhood === "Washington, D.C.") {
    // combine DC data
    let combinedData = Object.keys(dcPropertyTypes).map((key) => ({
      label: key,
      percent: dcPropertyTypes[key].percent,
      count: dcPropertyTypes[key].count,
    }));

    // sort
    combinedData.sort((a, b) => a.percent - b.percent);

    // assign variables
    percents = combinedData.map((item) => item.percent);
    counts = combinedData.map((item) => item.count);
    xLabels = combinedData.map((item) => item.label);
    title = `<b>Property Type</b> for Washington, D.C.<br><i style="font-size: .8em;">Percent of available Airbnb's</i>`;
    markerColors = combinedData.map((item) => colors.cityColor);
    customdata = counts.map((count) => ({
      count: count.toLocaleString(),
      total: totalDCCount.toLocaleString(),
    }));
  } else {
    // get total count for neighborhood
    const totalNeighborhoodCount = Object.values(
      neighborhoodPropertyTypes
    ).reduce((acc, obj) => acc + obj.count, 0);

    // combine neighborhood and DC data
    let combinedData = [
      ...Object.keys(neighborhoodPropertyTypes).map((key) => ({
        label: `${key}<br>(Neighborhood)`,
        percent: neighborhoodPropertyTypes[key].percent,
        count: neighborhoodPropertyTypes[key].count,
      })),
      ...Object.keys(dcPropertyTypes).map((key) => ({
        label: `${key}<br>(All of DC)`,
        percent: dcPropertyTypes[key].percent,
        count: dcPropertyTypes[key].count,
      })),
    ];

    // sort
    combinedData.sort((a, b) => a.percent - b.percent);

    // assign variables
    percents = combinedData.map((item) => item.percent);
    counts = combinedData.map((item) => item.count);
    xLabels = combinedData.map((item) => item.label);
    markerColors = combinedData.map((item) =>
      item.label.includes("Neighborhood")
        ? colors.neighborhoodColor
        : colors.cityColor
    );
    title = `Neighborhood <b>vs.</b> Washington, D.C.<br><b>Property Type</b> Comparison<br><i style="font-size: .8em;">Percent of available Airbnb's in Area</i>`;
    customdata = combinedData.map((item) => ({
      count: item.count.toLocaleString(),
      total: item.label.includes("Neighborhood")
        ? totalNeighborhoodCount.toLocaleString()
        : totalDCCount.toLocaleString(),
    }));
  }

  const trace = {
    y: xLabels,
    x: percents,
    type: "bar",
    orientation: "h",
    text: percents.map((percent) => percent + "%"),
    textposition: "auto",
    hovertemplate:
      "Percent: <b>%{y}%</b><br>Count: <b>%{customdata.count}</b> of %{customdata.total}<br><extra></extra>",
    customdata: customdata,
    marker: {
      color: markerColors,
      line: { color: "black", width: 1 },
    },
    showlegend: false, // hide legend for the main trace
  };

  // get legend traces
  const legendTraces = getLegendTraces(colors, selectedNeighborhood);

  const layout = {
    xaxis: { title: "Percent (%) of Total" },
    yaxis: {
      // title: "Property Type" ,
      tickangle: 35,
    },
    title: title,
    legend: {
      orientation: "h",
      y: -0.3,
      x: 0.5,
      xanchor: "center",
      yanchor: "top",
    },
  };

  Plotly.newPlot(plotContainer, [trace, ...legendTraces], layout);
}
