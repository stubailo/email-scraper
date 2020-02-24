import { getAllEmailsFromSearch } from "../client";

export async function findVenmoTransactions(client) {
  const query = "from:venmo@venmo.com after:2019/1/1 before:2020/1/1";

  const totalPayers = {};
  const totalPayees = {};

  const emails = await getAllEmailsFromSearch(client, query, 60);
  emails.forEach(({ headers, content }) => {
    const matchPayer =
      headers.subject.match(/(.+) paid you \$([0-9.,]+)/) ||
      headers.subject.match(/(.+) completed your \$([0-9.,]+)/);

    if (matchPayer) {
      const name = matchPayer[1];
      const amount = parseFloat(matchPayer[2].replace(",", ""), 10);
      totalPayers[name] = (totalPayers[name] || 0) + amount;
      return;
    }

    const matchPayee =
      headers.subject.match(
        /You completed (.+)'s \$([0-9.,]+) charge request/
      ) || headers.subject.match(/You paid (.+) \$([0-9.,]+)/);

    if (matchPayee) {
      const name = matchPayee[1];
      const amount = parseFloat(matchPayee[2].replace(",", ""), 10);
      console.log(`${headers.subject}`);
      console.log(name, amount);
      totalPayees[name] = (totalPayees[name] || 0) + amount;
    }
  });

  const totalPayersArray = Object.entries(totalPayers);
  totalPayersArray.sort((l, r) => r[1] - l[1]);
  console.log("top payers:");
  console.log(totalPayersArray.slice(0, 5));

  const totalPayeesArray = Object.entries(totalPayees);
  totalPayeesArray.sort((l, r) => r[1] - l[1]);
  console.log("top payees:");
  console.log(totalPayeesArray.slice(0, 5));
}
