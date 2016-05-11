
import React, { Component, PropTypes } from 'react';
import AnimateChildren from '../../components-compositors/Animated/children';
import CallsToolbar from '../CallsToolbar';
import Response from '../Response';
import styles from './style.css';

export default class Calls extends Component {

  constructor (...args) {
    super(...args);
    this.state = {};
  }

  render () {
    let {hoveredIdx} = this.state;
    return (
      <div
        className='calls-container'
        onMouseLeave={() => this.setState({hoveredIdx: null})}
        {...this._test('container')}
      >
        {this.renderClear()}
        <h2 className={styles.header}>History</h2>
        <div className={`${styles.history} row`} ref={el => this._callsHistory = el}>
          {this.renderNoCallsMsg()}
          {this.renderCalls()}
        </div>
        <CallsToolbar
          call={this.props.calls[hoveredIdx]}
          callEl={this[`call-${hoveredIdx}`]}
          containerEl={this._callsHistory}
          actions={this.props.actions}
        />
      </div>
    );
  }

  renderClear () {
    if (!this.props.calls.length) {
      return;
    }

    return (
      <a
        {...this._test('remove')}
        title='Clear RPC calls history'
        onClick={() => this.props.reset()}
        className={styles.removeIcon}
        >
        <i className='icon-trash'></i>
      </a>
    );
  }

  renderNoCallsMsg () {
    if (this.props.calls.length) {
      return;
    }

    return (
      <AnimateChildren>
        <div>
          <h3 className={styles.historyInfo} {...this._test('empty')}>
            Fire up some calls and the results will be here.
          </h3>
        </div>
      </AnimateChildren>
    );
  }

  renderCalls () {
    const {calls} = this.props;
    if (!calls.length) {
      return;
    }

    const _calls = calls.map(
      (c, idx) => {
        return (
          <div
            key={calls.length - idx}
            onMouseEnter={() => this.setState({hoveredIdx: idx})}
            ref={el => this[`call-${idx}`] = el}
            className={styles.call}
            {...this._test(`call-${c.callNo}`)}
            >
            <span className={styles.callNo}>#{c.callNo}</span>
            <pre>{c.name}({c.params.toString()})</pre>
            <Response response={c.response} />
          </div>
        );
      }
    );

    return <AnimateChildren>{_calls}</AnimateChildren>;
  }

}

Calls.propTypes = {
  calls: PropTypes.arrayOf(PropTypes.object).isRequired,
  actions: PropTypes.shape({
    fireRpc: PropTypes.func.isRequired,
    copyToClipboard: PropTypes.func.isRequired,
    selectRpcMethod: PropTypes.func.isRequired
  }).isRequired,
  reset: PropTypes.func
};