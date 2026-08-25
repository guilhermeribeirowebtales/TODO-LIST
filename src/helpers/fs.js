const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

/**
 * Search for a file recursively
 *
 * @param {String} dir
 * @param {String} pattern
 */
const searchRecursive = (dir, pattern, root = dir, project = process.env.PROJECT) => {
  let results = [];

  
  fs.readdirSync(dir).forEach(dirInner => {
    const fileName = dirInner;
    dirInner = path.resolve(dir, dirInner);

    let stat = fs.statSync(dirInner);

    if (stat.isDirectory()) {
      results = results.concat(searchRecursive(dirInner, pattern, root, project));
    }
    
    if (stat.isFile() && dirInner.endsWith(pattern)) {
      results.push(dirInner);
    }
  });
  return results;
};

const openFileAsString = (filePath) => {
  let fileString = '';

  try {
    fileString = fs.readFileSync(`${rootDir}`+filePath, { encoding: "utf8" });
  } catch (error) {
    console.log(error)
  }

  return fileString;

}

module.exports = {
  searchRecursive: searchRecursive,
  openFileAsString: openFileAsString
}