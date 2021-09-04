const spdxLicenseList = require('spdx-license-list/full');
const nlp = require( 'wink-nlp-utils' );
var cosine = require( 'wink-distance' ).bow.cosine;
import { diffWords } from 'diff';

const licenseCount = Object.keys(spdxLicenseList).length;

function createBagOfWords(text) {
  var normalizedText = nlp.string.removeHTMLTags(String(text));
  normalizedText = nlp.string.removePunctuations(normalizedText);
  normalizedText = nlp.string.removeExtraSpaces(normalizedText);
  normalizedText = normalizedText.toLowerCase();

  var textTokens = normalizedText.trim().split(/\s+/);
  return nlp.tokens.bagOfWords(textTokens);
}

function precomputeBOWs() {
  var d = {};
  for (const code in spdxLicenseList) {
    const data = spdxLicenseList[code];
    const text = data.licenseText;
    const bow = createBagOfWords(text);
    d[code] = {
      bow: bow,
    };
  }
  return d;
}

const knownLicenses = precomputeBOWs();

onmessage = function(event) {
  postMessage({
    workerRunning: true,
  });
  const text = event.data.text;
  const textBOW = createBagOfWords(text);

  var bestCode = '';
  var bestScore = Number.MAX_SAFE_INTEGER;
  var processed = 0;
  
  for (const code in knownLicenses) {
    const d = knownLicenses[code];
    const score = cosine(d.bow, textBOW);
    if (score < bestScore) {
      bestCode = code;
      bestScore = score;
    }
  }

  const d = spdxLicenseList[bestCode]
  const changes = diffWords(d.licenseText, text);
  postMessage({
    score: bestScore,
    spdx: bestCode,
    best: {
      name: d.name,
      url: d.url,
    },
    changes: changes,
    workerRunning: false,
  });
};

postMessage({workerLoaded: true})

