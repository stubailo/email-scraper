import { getAllEmailsFromSearch } from "../gmail";
import fs from "fs";

// Load up lat, long pairs
const CODES_TO_LAT_LONG = JSON.parse(
  fs.readFileSync(__dirname + "/../../data/airport-code-to-lat-lng.json", {
    encoding: "utf-8"
  })
);

export async function identifyFlights(client) {
  let total = 0;
  let totalMiles = 0;

  const chaseEmails = await getChaseEmails(client);
  const southwestEmails = await getSouthwestEmails(client);
  // TODO: couldn't get united to work
  // const unitedEmails = await getUnitedEmails(client);

  const allEmails = chaseEmails.concat(southwestEmails);

  allEmails.forEach(({ headers, content }) => {
    console.log(`${headers.subject}`);
    const flights = getFlightsFromEmail({ headers, content });

    flights.forEach(([codeStart, codeEnd]) => {
      let latStart, longStart, latEnd, longEnd;
      try {
        [latStart, longStart] = CODES_TO_LAT_LONG[codeStart];
      } catch (e) {
        throw new Error(
          `could not find coordinates for airport: '${codeStart}'`
        );
      }

      try {
        [latEnd, longEnd] = CODES_TO_LAT_LONG[codeEnd];
      } catch (e) {
        throw new Error(`could not find coordinates for airport: '${codeEnd}'`);
      }

      const distanceInKm = distanceInKmBetweenEarthCoordinates(
        latStart,
        longStart,
        latEnd,
        longEnd
      );

      // Assuming 115g per passenger per km
      // Per https://www.carbonindependent.org/22.html
      const carbonKg = distanceInKm * 0.115;

      console.log(
        `${codeStart} -> ${codeEnd}`,
        `${Math.round(distanceInKm)}km`,
        `${Math.round(carbonKg)}kg carbon`
      );

      totalMiles += distanceInKm * 0.621371;
      total += carbonKg;
    });
  });

  console.log("number of flights", allEmails.length);
  console.log("total miles", Math.round(totalMiles));
  console.log("total co2 kg", Math.round(total * 0.411));
}

// From Stack Overflow here:
// https://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates
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

function getFlightsFromEmail({ headers, content }) {
  let airportCodeRegex = />[^<>]*[^A-Za-z0-9]([A-Z][A-Z][A-Z])[^A-Za-z0-9][^<>]*</g;
  if (headers.from.startsWith("Southwest")) {
    airportCodeRegex = />([A-Z][A-Z][A-Z]) [0-9:]+</g;
  } else if (headers.from.match(/Receipts@united\.com/)) {
    airportCodeRegex = /\(([A-Z][A-Z][A-Z])\)<\/td>/g;
  }

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
      "expected email to have an even number of airport codes, but it had " +
        airportsInThisEmail.length +
        ": " +
        airportsInThisEmail.join(", ")
    );
  }

  if (airportsInThisEmail.length === 0) {
    throw new Error("expected email to have airport codes but found none");
  }

  const flights = [];

  // Iterate over pairs of airports
  for (let i = 0; i < airportsInThisEmail.length / 2; i++) {
    // Create pairs ['SFO', 'BUR']
    flights.push([airportsInThisEmail[i * 2], airportsInThisEmail[i * 2 + 1]]);
  }

  return flights;
}

async function getChaseEmails(client) {
  const chaseQuery =
    "from:chasetravelbyexpedia@link.expediamail.com " +
    "after:2019/1/1 before:2020/1/1";

  const itineraryIds = {};
  const chaseEmails = await getAllEmailsFromSearch(client, chaseQuery, 40);
  const deduplicatedChaseEmails = chaseEmails.filter(({ headers }) => {
    // Deduplicate itinerary IDs from chase travel
    if (headers["reply-to"] === "chasetravelbyexpedia@link.expediamail.com") {
      const itineraryId = headers.subject.split(" ")[
        headers.subject.split(" ").length - 1
      ];
      if (itineraryIds[itineraryId]) {
        return false;
      }
      itineraryIds[itineraryId] = true;
      return true;
    }
  });

  return deduplicatedChaseEmails;
}

async function getSouthwestEmails(client) {
  const query =
    "subject:(confirmed) from:southwest after:2019/1/1 before:2020/1/1";

  return await getAllEmailsFromSearch(client, query, 40);
}

async function getUnitedEmails(client) {
  const query =
    "subject:(eticket confirmation) from:Receipts@united.com after:2019/1/1 before:2020/1/1";

  return await getAllEmailsFromSearch(client, query, 40);
}
