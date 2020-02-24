import Client, { getAllEmailsFromSearch } from "./client";
import { formatMessages } from "./format";
import { identifyFlights } from "./scripts/flight-carbon";
import { findVenmoTransactions } from "./scripts/venmo";

export async function runScript(account) {
  const client = await Client.create(account);
  const now = Date.now();
  if (
    !client.account.tokens.access_token ||
    client.account.tokens.expiry_date < now
  ) {
    require("./server");
  }

  await countLyftCarbon(client);
  // await countUberCarbon(client);
  // await identifyFlights(client);
  // await findVenmoTransactions(client);

  const endTime = Date.now();
}

async function countLyftCarbon(client) {
  let total = 0;

  // Filter down emails with Gmail search query
  const query = 'from:("lyft ride receipt") after:2019/1/1 before:2020/1/1';
  const allEmails = await getAllEmailsFromSearch(client, query, 40);

  allEmails.forEach(({ headers, content }) => {
    // Find ride distance in email by looking for strings like 12.34mi
    const match = content.match(/\(([0-9.]+)mi/);
    if (match) {
      const miles = parseFloat(match[1], 10);
      total += miles;
      console.log(`${headers.subject}: ${miles}`);
    }
  });

  console.log("number of rides", allEmails.length);
  console.log("total miles", Math.round(total));
  console.log("total co2 kg", Math.round(total * 0.411));
}

async function countUberCarbon(client) {
  let total = 0;
  const query =
    'from:("Uber Receipts") subject:"trip with uber" ' +
    "after:2019/1/1 before:2020/1/1";

  const allEmails = await getAllEmailsFromSearch(client, query, 40);

  allEmails.forEach(({ headers, content }) => {
    const match = content.match(/([0-9.]+) mi/);
    if (match) {
      const miles = parseFloat(match[1], 10);
      total += miles;
      console.log(`${headers.subject}: ${miles}`);
    }
  });

  console.log("number of rides", allEmails.length);
  console.log("total miles", Math.round(total));
  console.log("total co2 kg", Math.round(total * 0.411));
}
