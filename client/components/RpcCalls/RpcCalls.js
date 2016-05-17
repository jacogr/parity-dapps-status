
import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import Toggle from 'material-ui/Toggle/Toggle';
import AutoComplete from '../AutoComplete';
import TextField from 'material-ui/TextField';

import { formatRpcMd } from '../../util/rpc-md';
import AnimateChildren from '../../components-compositors/Animated/children';
import JsonEditor from '../JsonEditor';
import Calls from '../Calls';
import Markdown from '../Markdown';
import styles from './style.css';
import rpcData from '../../data/rpc.json';
import RpcNav from '../RpcNav';

const rpcMethods = _.sortBy(rpcData.methods, 'name');

class RpcCalls extends Component {

  constructor (...args) {
    super(...args);
    this.state = {};
  }

  componentWillReceiveProps (nextProps) {
    const { paramsValues, params } = nextProps.rpc.selectedMethod;
    if (paramsValues) {
      params.map((p, idx) => {
        // todo [adgo] 01.05.2016 - make sure this works
        // not sure idx is the same for paramsValues and params
        this.setState({
          [this.paramKey(p)]: paramsValues[idx]
        });
      });

      if (this.state.jsonMode) {
        this.setJsonEditorValue();
      }
    }
  }

  render () {
    return (
      <div className='dapp-flex-content'>
        <main className='dapp-content'>
          <div className='dapp-container'>
            <div className='row'>
              <div className='col col-6'>
                <h1><span>RPC</span> Requests</h1>
              </div>
              <div className='col col-6'>
                <RpcNav />
              </div>
            </div>
          </div>
          <div style={{clear: 'both'}}></div>
          <div className='dapp-container'>
            <div className='row'>
              <div className='col col-6 mobile-full'>
                {this.renderForm()}
              </div>
              <div className='col col-6 mobile-full'>
                <Calls
                  calls={this.props.rpc.prevCalls}
                  reset={this.props.actions.resetRpcPrevCalls}
                  actions={this.props.actions}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  renderForm () {
    return (
      <div>
        <Toggle
          className={styles.jsonToggle}
          onToggle={::this.onJsonToggle}
          label='JSON'
        />
        <h2 className={styles.header}>
          <label htmlFor='selectedMethod'>
            Call Method
          </label>
        </h2>
        <AnimateChildren absolute>
          {this.renderJsonForm()}
          {this.renderInputForm()}
        </AnimateChildren>
      </div>
    );
  }

  renderInputForm () {
    if (this.state.jsonMode) {
      return;
    }

    const { returns } = this.props.rpc.selectedMethod;
    return (
      <div className='row'>
        {this.renderMethodList()}
        <h3>Parameters</h3>
        {this.renderInputs()}
        <h3>Returns</h3>
        <Markdown val={formatRpcMd(returns)} />
        {this.renderFormButton()}
      </div>
    );
  }

  renderMethodList () {
    const methods = rpcMethods.map(m => m.name);

    const { name, desc } = this.props.rpc.selectedMethod;
    return (
      <div>
        <AutoComplete
          style={{marginTop: 0}}
          searchText={name}
          floatingLabelText='Method name'
          dataSource={methods}
          onNewRequest={::this.handleMethodChange}
          {...this._test('autocomplete')}
        />
        <div>
          <Markdown val={desc} />
        </div>
      </div>
    );
  }

  handleMethodChange (name) {
    const method = rpcMethods.find(m => m.name === name);
    this.props.actions.selectRpcMethod(method);
  }

  onRpcFire () {
    if (this.state.jsonMode) {
      return this.onCustomRpcFire();
    }

    let { name, params, outputFormatter, inputFormatters } = this.props.rpc.selectedMethod;
    params = params.map(::this.jsonParamValue);

    this.props.actions.fireRpc({
      method: name,
      outputFormatter: outputFormatter,
      inputFormatters: inputFormatters,
      params
    });
  }

  onCustomRpcFire () {
    const { method, params } = this.state.jsonEditorParsedValue;
    this.props.actions.fireRpc({ method, params });
  }

  renderInputs () {
    let { params, name } = this.props.rpc.selectedMethod;

    if (!params || !params.length) {
      return (
        <span>none</span>
      );
    }

    return _.find(rpcMethods, { name })
            .params.map(
              p => {
                const onChange = (evt) => this.setState({
                  [this.paramKey(p)]: evt.target.value
                });

                if (_.isPlainObject(p)) {
                  return this.renderObjInputs(p);
                }

                return (
                  <TextField
                    key={p}
                    inputStyle={{marginTop: 0}}
                    fullWidth
                    hintText={p}
                    title={p}
                    hintStyle={{maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap'}}
                    value={this.paramValue(p)}
                    onChange={onChange}
                    {...this._test(this.paramKey(p))}
                  />
                );
              }
            );
  }

  renderObjInputs (param) {
    const { description, details } = param;

    return (
      <div>
        <Markdown val={description} />
        <ul>
          {Object.keys(details).map(k => {
            const onChange = (evt) => this.setState({
              [this.paramKey(`${description}.${k}`)]: evt.target.value
            });

            return (
              <li key={k}>
                <TextField
                  inputStyle={{marginTop: 0}}
                  fullWidth
                  title={`${k}: ${details[k]}`}
                  hintText={`${k}: ${details[k]}`}
                  hintStyle={{maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap'}}
                  value={this.paramValue(`${description}.${k}`)}
                  onChange={onChange}
                  {...this._test(this.paramKey(k))}
                />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  setJsonEditorValue () {
    const { name, params } = this.props.rpc.selectedMethod;
    const json = {
      method: name,
      params: params.map(::this.jsonParamValue)
    };
    this.setState({
      jsonEditorValue: json
    });
  }

  onJsonToggle () {
    if (!this.state.jsonMode) {
      this.setJsonEditorValue();
    }
    this.setState({jsonMode: !this.state.jsonMode});
  }

  renderJsonForm () {
    if (!this.state.jsonMode) {
      return;
    }

    return (
      <div>
        <JsonEditor
          onChange={::this.onJsonEditorChange}
          value={this.state.jsonEditorValue}
        />
        {this.renderFormButton()}
      </div>
    );
  }

  renderFormButton () {
    return (
      <button
        {...this._test('fireRpc')}
        className={'dapp-block-button'}
        disabled={this.state.jsonEditorError}
        onClick={::this.onRpcFire}
        >
        Fire!
      </button>
    );
  }

  onJsonEditorChange (jsonEditorParsedValue, jsonEditorError) {
    this.setState({
      jsonEditorParsedValue,
      jsonEditorError
    });
  }

  jsonParamValue (p) {
    if (_.isPlainObject(p)) {
      const { description, details } = p;
      return Object.keys(details).reduce((obj, key) => {
        obj[key] = this.paramValue(`${description}.${key}`);
        return obj;
      }, {});
    }

    return this.paramValue(p);
  }

  paramValue (p) {
    return this.state[this.paramKey(p)];
  }

  paramKey (p) {
    return `params_${p}`;
  }

}

RpcCalls.propTypes = {
  rpc: PropTypes.shape({
    prevCalls: PropTypes.array.isRequired,
    selectedMethod: PropTypes.object.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    fireRpc: PropTypes.func.isRequired,
    selectRpcMethod: PropTypes.func.isRequired,
    resetRpcPrevCalls: PropTypes.func.isRequired
  }).isRequired
};

export default RpcCalls;