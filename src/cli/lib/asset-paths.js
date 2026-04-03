const path = require("node:path");

const PACKAGED_BASENAME_MAP = new Map([
  [".gitignore", "__dot_gitignore__"]
]);

function getPackagedAssetRelativePath(relativePath) {
  const normalizedPath = relativePath.split(/[\\/]/).join("/");
  const parsedPath = path.posix.parse(normalizedPath);
  const packagedBasename = PACKAGED_BASENAME_MAP.get(parsedPath.base);

  if (!packagedBasename) {
    return normalizedPath;
  }

  return parsedPath.dir ? `${parsedPath.dir}/${packagedBasename}` : packagedBasename;
}

module.exports = {
  getPackagedAssetRelativePath
};
