import Client, { getAllEmailsFromSearch } from "./client";
import { formatMessages } from "./format";
import { identifyFlights } from "./scripts/flight-carbon";
import { findVenmoTransactions } from "./scripts/venmo";
import { countLyftCarbon, countUberCarbon } from "./scripts/uber-and-lyft";

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
