const path = require('path');
const { promisify } = require('util');
const _ = require('highland');
const glob = promisify(require('glob'));
const readFile = _.wrapCallback(require('fs').readFile);

async function getManifests(repoDir) {
  const fileNames = await glob(path.join(repoDir, 'manifests/**/*.json'));

  return new Promise((resolve, reject) => {
    const manifests = [];
    _(fileNames)
      .map(readFile)
      .parallel(10)
      .map(x => JSON.parse(x.toString()))
      .filter(x => x.key_path)
      .on('error', err => reject(err))
      .on('data', x => manifests.push(x))
      .on('end', () => resolve(manifests));
  });
}

module.exports = getManifests;
