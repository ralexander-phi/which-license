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
    maxProgress: numLicenses*2,
    progress: 0,
  });
  const text = event.data.text;
  const textSet = createWordSet(text);

  // Score every license
  var scores = [];
  var progress = 0;
  for (const code in knownLicenses) {
    const d = knownLicenses[code];
    const score = similarity.set.tversky(d.set, textSet);
    scores.push({
      score: score,
      code: code,
    })
    progress += 1;
    postMessage({
      workerRunning: true,
      progress: progress,
    });
  }

  // Take the ten best guesses (score < 0.5)
  const MAX_GUESSES = 10;
  const MIN_SCORE = 0.5;
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, MAX_GUESSES);
  console.log(scores);
  scores = scores.filter(s => s.score >= MIN_SCORE);
  var results = [];
  for (const i in scores) {
    const v = scores[i];
    var d = spdxLicenseList[v.code];
    var result = {
      score: v.score,
      spdx: v.code,
      best: {
        name: d.name,
        url: d.url,
      },
      changes: diffWords(d.licenseText, text, {ignoreCase: true}),
    };
    results.push(result);
    progress += (numLicenses/MAX_GUESSES);
    postMessage({
      workerRunning: true,
      progress: progress,
    });
  }
  postMessage({
    results: results,
    workerRunning: false,
    licenseTab: 0,
  });
};

postMessage({workerLoaded: true})

