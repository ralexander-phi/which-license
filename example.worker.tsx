const spdxLicenseList = require('spdx-license-list/full');
const nlp = require( 'wink-nlp-utils' );
var cosine = require( 'wink-distance' ).bow.cosine;

const licenses = Object.values(spdxLicenseList);
const MIN_CONFIDENCE = 60;

function createBagOfWords(text) {
  var normalizedText = nlp.string.removeHTMLTags(String(text));
  normalizedText = nlp.string.removePunctuations(normalizedText);
  normalizedText = nlp.string.removeExtraSpaces(normalizedText);
  var textTokens = nlp.string.tokenize(normalizedText);
  textTokens = nlp.tokens.removeWords(textTokens);
  return nlp.tokens.bagOfWords(textTokens);
}

onmessage = function(event) {
  const text = event.data.text;
  console.log("Processing: " + text);
  const textBOW = createBagOfWords(text);

  const scores = licenses.map(
    (license) => cosine(createBagOfWords(license.licenseText), textBOW)
  );

  const bestIndex = scores.indexOf(Math.min(...scores));
  const bestScore = scores[bestIndex];
  const best = licenses[bestIndex];

  postMessage(best);
};

