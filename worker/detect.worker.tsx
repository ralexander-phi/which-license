const spdxLicenseList = require('spdx-license-list/full');

const winkNLP = require( 'wink-nlp' );
const model = require( 'wink-eng-lite-web-model' );
const nlp = winkNLP( model );
const its = nlp.its;
const as = nlp.as;
const similarity = require('wink-nlp/utilities/similarity.js');

import { diffWords } from 'diff';

const licenseCount = Object.keys(spdxLicenseList).length;

function createWordSet(text) {
  const doc = nlp.readDoc(text);
  return doc.tokens().out(its.value, as.set);
}

function precomputeBOWs() {
  var d = {};
  for (const code in spdxLicenseList) {
    const data = spdxLicenseList[code];
    const text = data.licenseText;
    d[code] = {
      set: createWordSet(text),
    };
  }
  return d;
}

const knownLicenses = precomputeBOWs();

onmessage = function(event) {
  const numLicenses = Object.keys(knownLicenses).length;
  postMessage({
    workerRunning: true,
    maxProgress: numLicenses*1.2,
    progress: 0,
  });
  const text = event.data.text;
  const textSet = createWordSet(text);

  var bestCode = '';
  var bestScore = -1;
  
  var index = 0;
  for (const code in knownLicenses) {
    const d = knownLicenses[code];
    const score = similarity.set.tversky(d.set, textSet);
    if (score > bestScore) {
      bestCode = code;
      bestScore = score;
    }
    index += 1;
    postMessage({
      workerRunning: true,
      maxProgress: numLicenses*1.2,
      progress: index,
    });
  }

  const d = spdxLicenseList[bestCode];
  var changes = [];
  if (bestScore > 0.5) {
    changes = diffWords(d.licenseText, text, {ignoreCase: true});
  }
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

