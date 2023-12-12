// Function Fetch Listing Info
function fetchListingInfo(selectedListingId) {
    // Fetch data from JSON
    fetch('/api/listings_info')
        .then(response => response.json())
        .then(data => {
            // Convert selectedListingId to a string
            const selectedListingIdString = selectedListingId.toString();

            // Find the listing in the JSON data based on the selectedListingId
            const selectedListing = data.find(listing => listing.listing_id.toString() === selectedListingIdString);

            if (selectedListing) {
                // Populate the textarea with the description
                document.getElementById('textInput').value = selectedListing.description;

                // Create HTML to display other information (if needed)
                const listingInfoHTML = `
                    <h5>Listing ID No.: ${selectedListing.listing_id}</h5>
                    <p>Neighbourhood: ${selectedListing.neighbourhood_cleansed}</p>
                    <p>Property Type: ${selectedListing.property_type}</p>
                    <p>Bathrooms Text: ${selectedListing.bathrooms_text}</p>
                    <p>Bedrooms: ${selectedListing.bedrooms}</p>
                    <p>Beds: ${selectedListing.beds}</p>
                    <p>License: ${selectedListing.license}</p>
                `;

                // Add listing information to the panel
                document.getElementById('sample-metadata').innerHTML = listingInfoHTML;
            } else {
                // if listing is not found
                console.error('Selected listing not found.');
            }
        });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 // Function to populate the select list of the listings(cant change the position???)
 function populateSelect() {
    const select = document.getElementById('listingSelect');

    // Create a default option with the text "Select an ID" and an empty value
    const defaultOption = document.createElement('option');
    defaultOption.value = ''; 
    defaultOption.textContent = 'Select an ID';
    select.appendChild(defaultOption);

    // Fetch data from JSON
    fetch('/api/listings1')
        .then(response => response.json())
        .then(data => {
            // Loop through the data and add options to the select
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.listing_id;
                option.textContent = item.listing_id;
                select.appendChild(option);
            });
        });
}

// Display the list
populateSelect();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Function to  populate the list of the best listings with review scores rating = 5
function populateSelectbests() {
    const select = document.getElementById('selectOption');
    // Clear the list
    select.innerHTML = '';
    // Create a default "Select an ID" option
    const defaultOption = document.createElement('option');
    defaultOption.value = ''; 
    defaultOption.textContent = 'Select an ID';
    select.appendChild(defaultOption);

    // Fetch data from the JSON
    fetch('/api/best_score')
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.listing_id;
                option.textContent = item.listing_id;
                select.appendChild(option);
            });
        });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to populate details of the selected element best listing
function populateDetails() {
    const selectedListingId = document.getElementById('selectOption').value;
    const detailsDiv = document.getElementById('details');

    // Clear existing details
    detailsDiv.innerHTML = '';

    if (!selectedListingId) {
       
        return;
    }

    // Fetch data from the JSON file
    fetch(`/api/best_score?listing_id=${selectedListingId}`)
        .then(response => response.json())
        .then(data => {
            let selectedItem = data.find(item => item.listing_id.toString() === selectedListingId);

            if (selectedItem) {
                // Add info to the pannel of detail
                const detailsParagraphs = [];
                detailsParagraphs.push(`Listing ID: ${selectedItem.listing_id}`);
                detailsParagraphs.push(`Availability 30: ${selectedItem.availability_30}`);
                detailsParagraphs.push(`Availability 60: ${selectedItem.availability_60}`);
                detailsParagraphs.push(`Availability 90: ${selectedItem.availability_90}`);
                detailsParagraphs.push(`Availability 365: ${selectedItem.availability_365}`);
                detailsParagraphs.push(`Instant Bookable: ${selectedItem.instant_bookable ? 'Yes' : 'No'}`);
                detailsParagraphs.push(`Last Review: ${selectedItem.last_review}`);

                detailsParagraphs.forEach(detail => {
                    const paragraph = document.createElement('p');
                    paragraph.textContent = detail;
                    detailsDiv.appendChild(paragraph);
                });
            } else {
                // if no data found:
                console.log('No data found for the selected listing_id.');
            }
        });
}
  
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to fetch the min and max prices of listings
  // Fetch data from the Json
  function researchprice() {
    fetch('/api/price')
        .then(response => response.json())
        .then(data => {
            let minPrice = data[0]['min'];
            let maxPrice = data[0]['max'];

            // Add  prices to their input text
            document.getElementById('min_price').value = minPrice;
            document.getElementById('max_price').value = maxPrice;
        })
    }   

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Funtion to fetch for the number of listing having price between two given prices min and max
function researchnumberprice() {
    // Get the min and max prices from input texts
    const minPrice = parseFloat(document.getElementById('your_min_price').value);
    const maxPrice = parseFloat(document.getElementById('your_max_price').value);
  
    // Fetch data from  JSON
    fetch('/api/numberprice')
      .then(response => response.json())
      .then(data => {
        const filteredListings = data.filter(listing => {
          const listingPrice = parseFloat(listing.price);
          return listingPrice >= minPrice && listingPrice <= maxPrice;
        });
  
        // Count the number of found listings
        const numberOfListings = filteredListings.length;
  
        // Add the count to the  input text
        document.getElementById('number_l').value = numberOfListings;
      });
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to create a chart for the top ten property type by total number review
function chart_property_type() {
     // Fetch data from  JSON
    fetch('/api/listings_by_property_type')
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const propertytypes = data.map(item => item.property_type);
                const number_reviews = data.map(item => item.toltal_number_reviws_by_type_property);

                // Get the canvas element
                const canvas = document.getElementById('property_type_chart_container');

                // Check if there's an existing chart on this canvas and destroy it
                if (canvas.chart) {
                    canvas.chart.destroy();
                }

                // Create a bar chart
                const p = canvas.getContext('2d');
                canvas.chart = new Chart(p, {
                    type: 'bar',
                    data: {
                        labels: propertytypes,
                        datasets: [{
                            label: 'Number of Reviews',
                            data: number_reviews,
                            backgroundColor: 'rgba(255, 0, 0, 0.6)',
                            borderColor: 'rgba(255, 0, 0, 1)',
                            borderWidth: 1,
                        }],
                    },
                    options: {
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Top Ten Property Type by Total Number of Reviews',
                                font: {
                                    size: 16,
                                },
                            },
                        },
                    },
                });
            } else {
                console.log('No data found.');
            }
        });
}
chart_property_type();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to fetch and display the top ten neighborhood by total number review
function chart_by_neighbourhood() {
    // Fetch data from JSON
    fetch('/api/listings_by_neighborhood')
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);

            if (data.length > 0) {
                let neighborhoods = data.map(item => item.neighbourhood_cleansed);
                let number_reviews = data.map(item => item.toltal_number_reviws_by_neighborhood);

                // Get the canvas element
                const canvas = document.getElementById('neighborhood_chart_container');

                // Check if there's an existing chart on this canvas and destroy it
                if (canvas.chart) {
                    canvas.chart.destroy();
                }

                // Create a chart
                const ctx = canvas.getContext('2d');
                canvas.chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: neighborhoods,
                        datasets: [{
                            label: 'Number of Listings',
                            data: number_reviews,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        }],
                    },
                    options: {
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Top Ten Neighborhoods by Total Number of Reviews', 
                                font: {
                                    size: 16,
                                },
                            },
                        },
                    },
                });
            } else {
                console.log('No data found.');
            }
        });
}

// Display the chart
chart_by_neighbourhood();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to  create a bar chart using Plotly for Average Price By Neighborhood
function createChart() {
   // Fetch data from  JSON
    fetch('/api/expensive_neighborhood')
        .then(response => response.json())
        .then(data => {
            const neighborhoods = data.map(d => d.neighbourhood_cleansed);
            const avgPrices = data.map(d => d.av);
            // Create a trace for the bar chart
            const trace = {
                x: neighborhoods,
                y: avgPrices,
                type: 'bar',
                marker: {
                    color: 'rgba(75, 192, 192, 0.6)', 
                },
            };

            // Define the layout for the chart
            const layout = {
                xaxis: {
                    tickangle: 90,
                },
                yaxis: {
                    title: 'Average Price',
                },
                margin: {
                    b:600, 
                },
                height: 1000, 
            };
            // Create the chart 
            Plotly.newPlot('bar', [trace], layout);
        });
}

// Display the chart
createChart();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to  create a pie  chart using Plotly for Room Type Distribution
function createRoomTypeChart() {
    // Fetch data from  JSON
    fetch('/api/room_type')
        .then(response => response.json())
        .then(data => {
            const labels = data.map(entry => entry.room_type);
            const percentages = data.map(entry => entry.room_type_percentage);

            // Create a pie chart using Plotly
            const trace = {
                labels: labels,
                values: percentages,
                type: 'pie',
                marker: {
                    colors: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
                }
            };

            const layout = {
                title: 'Room Type Percentage',
            };

            Plotly.newPlot('roomTypeChart', [trace], layout);
        });
}

// Display the chart
window.addEventListener('load', createRoomTypeChart);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to populate table and create chart for counting listing
function populateLicenseTableAndChart() {
    // Fetch data from JSON
    fetch('/api/license')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#licenseTable tbody');
            const nullCount = data[0].null_license_count;
            const hostedCount = data[0].hosted_license_count;
            const unhostedCount = data[0].unhosted_license_count;
            const exemptCount = data[0].exempt_license_count;
            const otherCount = data[0].other_license_count;

            // Populate the table rows
            const rows = [
                { licenseType: 'Null License', count: nullCount },
                { licenseType: 'Hosted License', count: hostedCount },
                { licenseType: 'Unhosted License', count: unhostedCount },
                { licenseType: 'Exempt', count: exemptCount },
            ];

            rows.forEach(row => {
                const newRow = tableBody.insertRow();
                const cell1 = newRow.insertCell(0);
                const cell2 = newRow.insertCell(1);
                cell1.textContent = row.licenseType;
                cell2.textContent = row.count;
            });

            // Create a donut chart
            const licenseChartCanvas = document.querySelector('#licenseChart');
            new Chart(licenseChartCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['Null License', 'Hosted License', 'Unhosted License', 'Exempt'],
                    datasets: [{
                        data: [nullCount, hostedCount, unhostedCount, exemptCount],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                        ],
                    }],
                },
                options: {
                    responsive: true,
                },
            });
        });
}

// Display the chart
window.addEventListener('load', populateLicenseTableAndChart);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to create chart of Calculated Host Listings
function updateChart(data) {
    const chartContainer = document.getElementById('chartContainer');
    
    // Extract the data from the table
    const labels = Array.from(document.querySelectorAll('#apiTable tbody tr td:first-child')).map(cell => cell.textContent);
    const values = Array.from(document.querySelectorAll('#apiTable tbody tr td:nth-child(2)')).map(cell => parseInt(cell.textContent));
    
    // Create a new bar chart using Plotly
    const trace = {
      x: labels,
      y: values,
      type: 'bar',
      marker: {
        color: 'rgba(255, 206, 86, 0.7)'
      }
    };
    
    const layout = {
      title: 'Number of the Total Host Listing By Type of Property',
      xaxis: {
        title: 'Calculated Host Listings' 
      },
      yaxis: {
        title: 'Total Calculated Host Listings' 
      }
    };
    // Display the chart
    Plotly.newPlot(chartContainer, [trace], layout);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Funtion to create a table to display Calculated Host Listings
  function countTypeListing() {
    const selectedOption = document.querySelector('input[name="apiOption"]:checked').value;
    let apiUrl = '';
    let columns = 0; 
    switch (selectedOption) {
      case '1':
        apiUrl = '/api/host_listings_count_entire_homes';
        columns = 2;
        break;
      case '2':
        apiUrl = '/api/host_listings_count_private_rooms';
        columns = 2; 
        break;
      case '3':
        apiUrl = '/api/listings_count_shared_rooms';
        columns = 2; 
        break;
      default:
        apiUrl = '';
    }
  
    // Fetch data from JSON depending on the selected radio option
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const tableBody = document.querySelector('#apiTable tbody');
        tableBody.innerHTML = '';
  
        // Loop through the data and populate the table
        data.forEach(item => {
          const row = tableBody.insertRow();
  
          for (let i = 0; i < columns; i++) {
            const cell = row.insertCell(i);
  
            // Populate the cells
            if (i === 0) {
              if (selectedOption === '1') {
                cell.textContent = item.calculated_host_listings_count_entire_homes;
              } else if (selectedOption === '2') {
                cell.textContent = item.calculated_host_listings_count_private_rooms;
              } else if (selectedOption === '3') {
                cell.textContent = item.calculated_host_listings_count_shared_rooms;
              }
            } else if (i === 1) {
              cell.textContent = item.count;
            }
          }
        });
        updateChart(data);
      });
  }

  // Add event listener to the radio buttons for the changes
const radioButtons = document.querySelectorAll('input[name="apiOption"]');
radioButtons.forEach(radioButton => {
  radioButton.addEventListener('change', countTypeListing);
});

// Set the first radio button to checked when the page loads
document.querySelector('input[name="apiOption"][value="1"]').checked = true;
  
  // Initial load based on the default radio checked
  countTypeListing();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to look and display the Average Price and Average Adjusted Price
const showPriceCheckbox = document.getElementById('showPrice');
const showAdjustedPriceCheckbox = document.getElementById('showAdjustedPrice');
const averagePriceSpan = document.getElementById('averagePrice');
const averageAdjustedPriceSpan = document.getElementById('averageAdjustedPrice');

showPriceCheckbox.addEventListener('input', fetchData);
showAdjustedPriceCheckbox.addEventListener('input', fetchData);

// Fetch data from JSON
function fetchData() {
    fetch('/api/price_adjustedPrice')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (showPriceCheckbox.checked) {
                averagePriceSpan.textContent = data[0].average_price;
            } else {
                averagePriceSpan.textContent = '';
            }

            if (showAdjustedPriceCheckbox.checked) {
                averageAdjustedPriceSpan.textContent = data[0].average_adjusted_price;
            } else {
                averageAdjustedPriceSpan.textContent = '';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Initial fetch
fetchData();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to populate the select list of hosts
function populateSelectHost() {
    const select = document.getElementById('hostSelect');

    // Create the "Select ID" option
    const selectIdOption = document.createElement('option');
    selectIdOption.value = ''; 
    selectIdOption.textContent = 'Select ID';
    select.appendChild(selectIdOption);

    // Fetch data from JSON
    fetch('/api/host_info')
        .then(response => response.json())
        .then(data => {
            // Loop through the data and add options to the select
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.host_id;
                option.textContent = item.host_id;
                select.appendChild(option);
            });
        });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to fetch and display host information based on the selected host ID
function fetchHostInfo(selectedHostId) {
    // Fetch data from  JSON
    fetch('/api/host_info')
        .then(response => response.json())
        .then(data => {
            // Convert selectedHostId to a string
            const selectedHostIdString = selectedHostId.toString();

            // Find the host in the JSON data based on the selectedHostId
            const selectedHost = data.find(host => host.host_id.toString() === selectedHostIdString);

            if (selectedHost) {
                // Create HTML to display the information
                const hostInfoHTML = `
                    <h5>Host ID No.: ${selectedHost.host_id}</h5>
                    <p>Host Name: ${selectedHost.host_name}</p>
                    <p>Host Response Rate: ${selectedHost.host_response_rate}</p>
                    <p>Host Superhost: ${selectedHost.host_is_superhost}</p>
                    <p>Host Listing Count: ${selectedHost.host_listings_count}</p>
                    <p>Host ID Verified: ${selectedHost.host_identity_verified}</p>
                    <p>Host Has a Picture: ${selectedHost.host_has_profile_pic}</p>
                `;

                // Add host information to the panel
                document.getElementById('host-metadata').innerHTML = hostInfoHTML;
            } else {
                // if host is not found
                console.error('Selected host not found.');
            }
        });
}

// Get the <select> element by its ID
const hostSelect = document.getElementById('hostSelect');

// Call populateSelectHost function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    populateSelectHost();
});

// Call fetchHostInfo function when the selected option changes
hostSelect.addEventListener('change', () => {
    const selectedHostId = hostSelect.value;
    fetchHostInfo(selectedHostId);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to fetch the minimum of minimum nights input
function minMin() {
    // Fetch data from  JSON
    fetch('/api/min_max_night')
      .then(response => response.json())
      .then(data => {
        const minMinValue = data[0].min;
        const minMinInput = document.getElementById('input3');
        minMinInput.value = minMinValue+" day(s)";
      });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function to fetch and update the maximum of maximum nights input
function maxMax() {
    // Fetch data from  JSON
    fetch('/api/min_max_night')
      .then(response => response.json())
      .then(data => {
        const maxMaxValue = data[0].max;
        const maxMaxInput = document.getElementById('input4');
        maxMaxInput.value = maxMaxValue+" day(s)";
      });
}