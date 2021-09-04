import { Component } from 'react';

var worker;

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

interface DetectState {
  text: string
  workerLoaded: boolean
  workerRunning: boolean
  score: number
  spdx: string
  best: {
    name: string
    url: string
  }
  changes: Array<{
    added: string
    removed: string
  }>
}

export default class Example extends Component<{}, DetectState> {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      workerLoaded: false,
      workerRunning: false,
      score: 0,
      spdx: '',
      best: null,
      changes: null,
    };
  }

  componentDidMount() {
    worker = new Worker(new URL('../worker/detect.worker.tsx', import.meta.url))

    worker.addEventListener('message', (e) => {
      this.setState(e.data);
    });
  }

  componentWillUnmount() {
    worker.terminate();
  }

  render() {
    if (this.state.workerRunning) {
      return (<progress max="1" />)
    } else if (this.state.best) {
      if (this.state.score > 0.5) {
        // TODO needs a back button
        return (<p>Unknown license</p>)
      } else {
        return (<>
        <button onClick={(e) => {
          this.setState({
            text: '',
            best: null,
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
            text: e.target.value,
          });
        }}
        value={this.state.text} />

        <button 
          disabled={! this.state.workerLoaded}
          onClick={e => {
            // TODO button double click?
            worker.postMessage({ text: this.state.text });
        }}>
        { this.state.workerLoaded && <>Search</> }
        { ! this.state.workerLoaded && <>Loading...</> }
        </button>

        <p className="help is-info">
          Paste software license text above to start detection.
        </p>
        </>);
    }
  }
}
