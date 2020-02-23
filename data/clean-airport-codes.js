const fs = require("fs");

// Data downloaded from https://datahub.io/core/airport-codes
const data = JSON.parse(
  fs.readFileSync(__dirname + "/airport-codes_json.json", { encoding: "utf-8" })
);

// Filter down to only airports with IATA codes
const airportCodesOnly = data.filter(airport => airport.iata_code);
const codesToLatLng = {};

airportCodesOnly.forEach(airport => {
  // For some reason the coordinates are backwards in the data set
  const [lng, lat] = airport.coordinates
    .split(", ")
    .map(c => parseFloat(c, 10));
  codesToLatLng[airport.iata_code] = [lat, lng];
});

fs.writeFileSync(
  __dirname + "/airport-code-to-lat-lng.json",
  JSON.stringify(codesToLatLng, null, 2),
  {
    encoding: "utf-8"
  }
);
