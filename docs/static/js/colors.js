// set default color scheme
const defaultColors = {
    airbnbs: "red",
    neighborhoodLayer: "green",
    defaultGray: "#343a40", // #6c757d
    neighborhoodColor: "#198754",
    neighborhoodColorLight: "lightgreen",
    cityColor: "#0085A1",
    cityColorLight: "lightblue",
};

const licenseColors = {
Licensed: "green",
Exempt: "yellow",
"No License": "red",
default: "gray",
};

const propertyTypeColors = {
"Entire home/apt": "orange",
"Private room": "blue",
"Shared room": "green",
"Hotel room": "red",
default: "purple",
};
  
// helper function to determine marker color based on license status
function getLicenseColor(licenseCategory) {
    switch (licenseCategory) {
      case "Licensed":
        return "green";
      case "Exempt":
        return "yellow";
      case "No License":
        return "red";
      default:
        return "gray";
    }
  }
  
  // helper function to determine marker color based on property type
  function getPropertyTypeColor(propertyType) {
    switch (propertyType) {
      case "Entire home/apt":
        return "orange";
      case "Private room":
        return "blue";
      case "Shared room":
        return "green";
      case "Hotel room":
        return "red";
      default:
        return "purple";
    }
  }
    