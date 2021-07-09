import { licenseData } from './licenseData'
import { distance, closest } from 'fastest-levenshtein';
import React from 'react';

export default function Layout({}: {}) {
    const [text, setText] = React.useState("");

    const MIN_CONFIDENCE = 60;

    const scores = licenseData.map(
      x => distance(x.text, text)
    );
    const bestIndex = scores.indexOf(Math.min(...scores));
    const bestScore = scores[bestIndex];
    const best = licenseData[bestIndex];
    const licenseLength = Math.max(text.length, best.text.length);
    const confidence = Math.floor(((licenseLength - bestScore) / licenseLength) * 100);
    return (
      <>
        <textarea onChange={e => {
          console.log(e);
          setText(e.target.value);
        }
        }>{text}</textarea>

        { text.length == 0 &&
          <p className="help is-info">Paste software license text above to start detection.</p>
        }

        { text.length > 0 && confidence >= MIN_CONFIDENCE &&
          <>
          <h2>{ best.name }</h2>
          <p><strong>{ confidence }% confidence</strong></p>
          <a href={ best.ref }>Learn More</a>
          </>
        }

        { text.length > 0 && confidence < MIN_CONFIDENCE &&
          <>
          <h2>Unable to determine license.</h2>
          If you figure it out on your own, can you send a pull request here?
          I'd like to add this license.
          </>
        }
      </>
    )
  }
