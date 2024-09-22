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
}

// master function to call plots for neighborhoods
function neighborhoodPlots(listingsData, selectedNeighborhood) {
  plotLocation(listingsData, selectedNeighborhood);
}

// conditional for data for all of DC or neighborhood
function plotLocation(listingsData, selectedNeighborhood) {
    const isDC = selectedNeighborhood === "Washington, D.C.";
    const dcStats = calculateStats(listingsData);

    let meanPrice, medianPrice, meanRating, medianRating;

    if (!isDC) {
        const neighborhoodStats = calculateStats(filterListingsByNeighborhood(listingsData, selectedNeighborhood));
        ({ meanPrice, medianPrice, meanRating, medianRating } = neighborhoodStats);
    } else {
        ({ meanPrice, medianPrice, meanRating, medianRating } = dcStats);
    }

    updatePriceAndRatingsPlot("price", selectedNeighborhood, meanPrice, medianPrice, dcStats.meanPrice, dcStats.medianPrice);
    updatePriceAndRatingsPlot("ratings", selectedNeighborhood, meanRating, medianRating, dcStats.meanRating, dcStats.medianRating);
}

// plot of price and ratings for all of DC or a neighborhood
function updatePriceAndRatingsPlot(plotType, selectedNeighborhood, mean, median, dcMean, dcMedian) {
  // get container
  let plotContainer = document.querySelector(`#${plotType}-plot`);

  let chosenData, xLabels, yTitle;

  if (plotType === "price") {
    if (selectedNeighborhood === "Washington, D.C.") {
      chosenData = [dcMean, dcMedian];
      xLabels = ["Mean (All of DC)", "Median (All of DC)"];
    } else {
      chosenData = [mean, median, dcMean, dcMedian];
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
      chosenData = [dcMean, dcMedian];
      xLabels = ["Mean (All of DC)", "Median (All of DC)"];
    } else {
      chosenData = [mean, median, dcMean, dcMedian];
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
    hovertemplate: plotType === "price" ? "%{y:$,.2f}" : "%{y:.2f}",
    marker: {
      color:
        selectedNeighborhood === "Washington, D.C."
          ? ["blue", "blue"]
          : ["orange", "orange", "blue", "blue"],
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

