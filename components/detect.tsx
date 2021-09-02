import React, { Component } from 'react';

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
      score: null,
      spdx: null,
      best: null,
      changes: null,
      progress: null,
    };
  }

  componentDidMount() {
    this.worker = new Worker(new URL('../worker/detect.worker.tsx', import.meta.url));
    this.worker.addEventListener('message', (e) => {
      this.setState({
        score: e.data.score,
        spdx: e.data.spdx,
        best: e.data.best,
        changes: e.data.changes,
        progress: e.data.progress,
      });
    });
  }

  componentWillUnmount() {
    this.worker.terminate();
  }

  render() {
    if (this.state.progress) {
      return (<meter value={ this.state.progress } />)
    } else if (this.state.best) {
      if (this.state.score > 0.5) {
        // TODO needs a back button
        return (<p>Unknown license</p>)
      } else {
        return (<>
        <button onClick={(e) => {
          this.setState({
            text: '',
            score: null,
            spdx: null,
            best: null,
            changes: null,
            progress: null,
          });
        }}>Try another</button>

        <p>
          <strong>Potentially based on { this.state.best.name } license</strong>
        </p>

        <p className="help is-info">
          {/* See: https://github.com/spdx/license-list-data */}
          <a href={"https://spdx.org/licenses/" + this.state.spdx + ".html"}>
            SPDX: { this.state.spdx }
          </a>
        </p>

        <p>
          {/* TODO do they all have URLs? */}
          {/* TODO TLDR link */}
          <a href={ this.state.best.url }>Learn More</a>
        </p>

        <p className="help">
          Detected changed:
        </p>

        { this.state.changes.map(change => renderChange(change)) }
        </>);
      }
    } else {
      return (<>
        <textarea
        style={{
          width: '100%',
        }}
        onChange={e => {
          this.setState({ 
            score: null,
            spdx: null,
            text: e.target.value,
            best: null,
            progress: null,
          });
        }}
        value={this.state.text} />

        <button onClick={e => {
            this.setState({
              score: null,
              spdx: null,
              best: null,
              changes: null,
              progress: null,
            });
            // TODO button double click?
            this.worker.postMessage({ text: this.state.text });
          }}>Search</button>

        <p className="help is-info">
          Paste software license text above to start detection.
        </p>
        </>);
    }
  }
}
