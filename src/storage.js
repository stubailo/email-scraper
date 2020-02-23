import fs from "fs";

export function getPersistentObject(filename) {
  let persistentObject = {};
  const path = __dirname + "/../temp/" + filename + ".json";

  try {
    persistentObject = JSON.parse(
      fs.readFileSync(path, {
        encoding: "utf-8"
      })
    );
  } catch (e) {
    // couldn't find the cache file
    console.log("initializing new file:", filename + ".json");
  }

  process.on("beforeExit", code => {
    fs.writeFileSync(path, JSON.stringify(persistentObject, null, 2));
    console.log("wrote storage file:", filename);
  });

  return persistentObject;
}
