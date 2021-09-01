import React, { Component } from 'react';
import { diffWords } from 'diff';

function renderChange(change) {
  let style;
  if (change['added']) {
    style = {
      'color': '#090',
      'backgroundColor': '#dfd',
    };
  } else if (change['removed']) {
    style = {
      'color': '#900',
      'backgroundColor': '#fdd',
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

export default class Example extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      bestLicenseText: ''
    };
  }

  componentDidMount() {
    this.worker = new Worker(new URL('../example.worker.tsx', import.meta.url));
    this.worker.addEventListener('message', (e) => {
      console.log("Predict: " + e.data.name);
      this.setState({ bestLicenseText: e.data.licenseText });
    });
  }

  componentWillUnmount() {
    this.worker.terminate();
  }

  render() {
    const changes = diffWords(this.state.bestLicenseText, this.state.text);
    return (
      <>
      <br />
      <textarea
      style={{
        width: '100%',
      }}
      onChange={e => {
        this.setState({ text: e.target.value });
      }}
      value={this.state.text} />

      <button onClick={e => {
        console.log("Ask to process: " + this.state.text );
        this.worker.postMessage({ text: this.state.text });
      }}>Search</button>

      { this.state.text.length == 0 &&
        <p className="help is-info">Paste software license text above to start detection.</p>
      }

      <br />
      <br />
      <br />
      <strong>Likely based on XXX license</strong>
      <br />
      <a href="">Learn More</a>
      <br />
      <br />
      <br />
      <br />
      <hr />
      <p className="help">Detected changed:</p>
      <br />
      { changes.map(change => renderChange(change)) }
      </>
    );
  }
}
