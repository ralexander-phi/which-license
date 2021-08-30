const spdxLicenseList = require('spdx-license-list/full');
const nlp = require( 'wink-nlp-utils' );
var cosine = require( 'wink-distance' ).bow.cosine;

import { diffWords } from 'diff';

function intersperseBreaks(parts) {
  let changed = parts.map(a => [a, (<br />)]).flat();
  changed.pop();
  return changed;
}

function renderChange(change) {
  let style;
  if (change['added']) {
    style = {
      'color': '#090',
      'background-color': '#dfd',
    };
  } else if (change['removed']) {
    style = {
      'color': '#900',
      'background-color': '#fdd',
    };
  } else {
    style = {
      'color': '#333',
    };
  }

  let parts = change.value.replace('\n', '⏎\n').split('\n');
  let changed = parts.map(a => [
      (
      <span style={style}>
      {a}
      </span>
      ),
      (<br />)
  ]).flat();
  changed.pop();
  return changed;
}

function createBagOfWords(text) {
    var normalizedText = nlp.string.removeHTMLTags(String(text));
    normalizedText = nlp.string.removePunctuations(normalizedText);
    normalizedText = nlp.string.removeExtraSpaces(normalizedText);
    var textTokens = nlp.string.tokenize(normalizedText);
    textTokens = nlp.tokens.removeWords(textTokens);
    return nlp.tokens.bagOfWords(textTokens);
}

export default function Layout({}: {}) {
    const [text, setText] = React.useState("");
    const MIN_CONFIDENCE = 60;
    const licenses = Object.values(spdxLicenseList);
    const textBOW = createBagOfWords(text);

    const scores = licenses.map(
      (x) => {
	      console.log('Checking ' + x.name);
	      var res = cosine(createBagOfWords(x.licenseText), textBOW);
	      console.log('    : ' + res);
	      return res;
      }
    );
    const bestIndex = scores.indexOf(Math.min(...scores));
    const bestScore = scores[bestIndex];
    const best = licenses[bestIndex];
    const licenseLength = Math.max(text.length, best.licenseText.length);
    const confidence = Math.floor(((licenseLength - bestScore) / licenseLength) * 100);
    const changes = diffWords(best.licenseText, text);
    return (
      <>
        <br />
        <textarea
          style={{
            width: '100%',
          }}
          onChange={e => {
            setText(e.target.value);
          }}
	  value={text} />

        { text.length == 0 &&
          <p className="help is-info">Paste software license text above to start detection.</p>
        }

        { text.length > 0 && confidence >= MIN_CONFIDENCE &&
          <>
          <br />
          <br />
          <br />
          <strong>Likely based on { best.name } license</strong>
          <br />
          <a href={ best.ref }>Learn More</a>
          <br />
          <br />
          <br />
          <br />
          <hr />
          <p class="help">Detected changed:</p>
          <br />
          { changes.map(change => renderChange(change)) }
          </>
        }

        { text.length > 0 && confidence < MIN_CONFIDENCE &&
          <>
          <h2>Unable to determine license.</h2>
          <p>Unfortunately, I'm not familiar with this license.</p>
          <p>If you're able to figure it out, can you <a href="https://github.com/ralexander-phi/which-license/issues">submit an issue here</a> to let me add support?</p>
          </>
        }
      </>
    );
  }
