import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import React from 'react';

import localStore from 'store';

import './index.html';
import './index.css';
import '!file-loader?name=icon.png!./icon.png';
import 'dapp-styles/dapp-styles.less';
import './env-specific';

import EthApi from 'ethapi-js';
import middlewares from './middleware';
import Routes from './routes';
import MuiThemeProvider from './components/MuiThemeProvider';

import configure from './store';
import Web3Provider from './provider/web3-provider';
import { initAppAction } from './actions/app';

const ethapi = new EthApi(new EthApi.Transport.Http(process.env.RPC_ADDRESS || '/rpc/'));

const store = configure(middlewares(ethapi));

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider>
      <Routes store={store} />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root')
);

new Web3Provider(ethapi, store).start();

(window || global).store = localStore;
(window || global).ethapi = ethapi;

store.dispatch(initAppAction());
