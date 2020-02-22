const Client = require("./client");
const format = require("./format");

module.exports = async function runScript(account) {
  const startTime = Date.now();

  const client = await Client.create(account);
  let page = 1;
  const now = Date.now();
  if (
    !client.account.tokens.access_token ||
    client.account.tokens.expiry_date < now
  ) {
    require("./server");
  }

  let hasMoreMessages = true;

  let allEmails = [];
  let total = 0;

  while (hasMoreMessages && page < 40) {
    const { messages, hasMore } = await client.fetchMessages(
      page,
      'from:("lyft ride receipt") after:2019/1/1 before:2020/1/1'
    );
    hasMoreMessages = hasMore;
    page++;
    const emails = format(messages).map(message => {
      let paragraphs = [];
      if (Array.isArray(message.paragraphs.length)) {
        paragraphs = message.paragraphs;
      } else {
        paragraphs = [message.paragraphs];
      }

      let miles = "";

      paragraphs.forEach(paragraph => {
        const match = paragraph.match(/\(([0-9.]+)mi/);
        if (match) {
          miles = parseFloat(match[1], 10);
          total += miles;
        }
      });

      return `${message.headers.subject}: ${miles}`;
    });

    allEmails = allEmails.concat(emails);
  }
  console.log(JSON.stringify(allEmails, null, 2));
  console.log("number of rides", allEmails.length);
  console.log("total miles", Math.round(total));
  console.log("total co2 kg", Math.round(total * 0.411));

  const endTime = Date.now();
  console.log("total time", endTime - startTime);
};
