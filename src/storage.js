import fs from "fs";

const namesTaken = {};

export function getPersistentObject(filename) {
  if (namesTaken[filename]) {
    throw new Error(
      "initialized same storage object twice, you might have a name collision in your code:",
      filename
    );
  }

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

  process.on("exit", code => {
    fs.writeFileSync(path, JSON.stringify(persistentObject, null, 2));
    console.log("wrote storage file:", filename);
  });

  return persistentObject;
}
