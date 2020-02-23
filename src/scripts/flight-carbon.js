import { getAllEmailsFromSearch } from "../gmail";
import fs from "fs";

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2 - lat1);
  var dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export async function identifyFlights(client) {
  let total = 0;
  const query =
    "from:chasetravelbyexpedia@link.expediamail.com " +
    "after:2019/1/1 before:2020/1/1";

  const allEmails = await getAllEmailsFromSearch(client, query, 40);

  // TODO: identify duplicate confirmations
  allEmails.forEach(({ headers, content }) => {
    console.log(`${headers.subject}`);
    const airportCodeRegex = />[^<>]*[^A-Za-z0-9]([A-Z][A-Z][A-Z])[^A-Za-z0-9][^<>]*</g;

    const airportsInThisEmail = [];
    let match;
    while ((match = airportCodeRegex.exec(content)) !== null) {
      if (match[1] === "CSS") {
        // CSS is a very small airport in Nashua, New Hampshire. In theory
        // someone could fly there, but in practice this is probably related
        // to CSS code
        continue;
      }

      if (match[1] === "GDS") {
        // GDS is a reservation system provider
        continue;
      }

      airportsInThisEmail.push(match[1]);
    }

    if (airportsInThisEmail.length % 2 !== 0) {
      throw new Error(
        "error: expected email to have an even number of airport codes, but it had",
        airportsInThisEmail.length
      );
      console.log(airportsInThisEmail);
    }

    const flights = [];

    // Iterate over pairs of airports
    for (let i = 0; i < airportsInThisEmail.length / 2; i++) {
      // Create pairs ['SFO', 'BUR']
      flights.push([
        airportsInThisEmail[i * 2],
        airportsInThisEmail[i * 2 + 1]
      ]);
    }

    // // Load up lat, long pairs
    // const codeToLatLong = fs.readFileSync(
    //   __dirname + "../data/airport-codes_json.json",
    //   { encoding: "utf-8" }
    // );

    console.log(flights);
  });

  console.log("number of rides", allEmails.length);
  console.log("total miles", Math.round(total));
  console.log("total co2 kg", Math.round(total * 0.411));
}
