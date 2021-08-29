const spdxLicenseList = require('spdx-license-list/full');

import { distance, closest } from 'fastest-levenshtein';
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

export default function Layout({}: {}) {
    const [text, setText] = React.useState("");
    const MIN_CONFIDENCE = 60;
    const licenses = Object.values(spdxLicenseList);
    const scores = licenses.map(
      (x) => distance(x.licenseText, text)
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
          }}>
        {text}
        </textarea>

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
