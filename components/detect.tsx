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
      return (<progress className="progress is-large is-dark m-4" />)
    } else if (this.state.best) {
      if (this.state.score > 0.5) {
        // TODO needs a back button
        return (<p>Unknown license</p>)
      } else {
        return (<>
          <section className="section">

          <button
            className="button is-link mb-5"
            onClick={(e) => {
              this.setState({
                text: '',
                best: null,
              });
            }}>
            <span className="icon mr-1">
              ⯇
            </span>
            Try another
          </button>

          <div className="notification is-info p-5 pb-6">
            <div className="container">
            <h1 className="title pb-4">Potentially based on { this.state.best.name }</h1>
            </div>

            <p className="help is-info">
              {/* See: https://github.com/spdx/license-list-data */}
              <a href={"https://spdx.org/licenses/" + this.state.spdx + ".html"}>
                SPDX: { this.state.spdx }
              </a>
            </p>

            <p>
              {/* TODO TLDR link */}
              { this.state.best.url &&
                  <a href={ this.state.best.url }>Learn More</a>
              }
            </p>

            <h2 className="subtitle is-3 pt-5 mb-1">
              Changes:
            </h2>
            <div className="content">
              <div className="box pb-6 pr-6">
              { this.state.changes.map(change => renderChange(change)) }
              </div>
            </div>
          </div>
          </section>
          </>);
      }
    } else {
      var searchClassExtra = ''
      if (! this.state.workerLoaded) {
        searchClassExtra = "is-loading";
      }
      return (<>
        <section className="section">

        <p className="help is-info">
          Paste a software license below to identify it.
        </p>

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
          className={ searchClassExtra + " button is-primary is-medium mt-3" }
          disabled={! this.state.workerLoaded}
          onClick={e => {
            // TODO button double click?
            worker.postMessage({ text: this.state.text });
        }}>Search</button>
        </section>
        </>);
    }
  }
}
