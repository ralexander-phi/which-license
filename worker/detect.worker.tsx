const spdxLicenseList = require('spdx-license-list/full');
const nlp = require( 'wink-nlp-utils' );
var cosine = require( 'wink-distance' ).bow.cosine;
import { diffWords } from 'diff';

const licenses = Object.keys(spdxLicenseList);
const MIN_CONFIDENCE = 60;

function createBagOfWords(text) {
  var normalizedText = nlp.string.removeHTMLTags(String(text));
  normalizedText = nlp.string.removePunctuations(normalizedText);
  normalizedText = nlp.string.removeExtraSpaces(normalizedText);
  normalizedText = normalizedText.toLowerCase();

  // Should work, but hits "too much recurrsion" on Firefox
  // var textTokens = nlp.tokens.removeWords(textTokens);
  var textTokens = normalizedText.split(/\s+/);

  return nlp.tokens.bagOfWords(textTokens);
}

onmessage = function(event) {
  const text = event.data.text;
  const textBOW = createBagOfWords(text);

  var bestIndex = -1;
  var bestScore = 9999999;
  
  for (var i = 0; i < licenses.length; i++) {
    const progress = i / (licenses.length);
    postMessage({ progress: progress });
    const licenseSPDX = licenses[i];
    const licenseData = spdxLicenseList[licenseSPDX];
    const score = cosine(createBagOfWords(licenseData.licenseText), textBOW)
    if (score < bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  const bestSPDX = licenses[bestIndex];
  const bestData = spdxLicenseList[bestSPDX];
  const changes = diffWords(bestData.licenseText, text);
  postMessage({
    score: bestScore,
    spdx: bestSPDX,
    best: bestData,
    changes: changes,
    progress: null,
  });
};

