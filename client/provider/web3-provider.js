
import { isArray, isObject, isEqual, compact } from 'lodash';
import { isBigNumber } from 'web3/lib/utils/utils';
import Web3Base from './web3-base';
import * as StatusActions from '../actions/status';
import * as MiningActions from '../actions/mining';
import * as DebugActions from '../actions/debug';

export default class Web3Provider extends Web3Base {

  state = {}

  constructor (ethapi, store) {
    super(ethapi);

    this.store = store;
    this.delay = 500;
    this.running = false;
    this.tickArr = this.getTickArr();
  }

  onStart () {
    this.ethapi.web3
      .clientVersion()
      .then(StatusActions.updateVersion)
      .then(::this.store.dispatch)
      .catch(err => {
        console.error(err);
        this.store.dispatch(StatusActions.error(err));
      });
  }

  onTickWhenDisconnected () {
    // When disconnected we are only checking single call.
    // After we connect again - onTick should refresh all other results.
    const call = this.tickArr[0];
    return call.method()
      .then(call.actionMaker)
      .then(this.store.dispatch)
      .catch(err => {
        this.store.dispatch(StatusActions.error(err));
      });
  }

  onTick () {
    if (this.store.getState().status.disconnected) {
      return this.onTickWhenDisconnected();
    }

    return Promise.all(this.tickArr.map((obj, idx) => {
      if (!obj.actionMaker) {
        console.error(obj);
        throw new Error(`Missing action creator for no ${idx}`);
      }
      return obj.method().then(obj.actionMaker)
        .catch(err => {
          const action = obj.actionMaker();
          console.error(`err for ${action.type} with payload ${action.payload}`);
          this.store.dispatch(StatusActions.error(err));
          return false; // don't process errors in the promise chain
        });
    }))
    .then(compact)
    .then(::this.filterChanged)
    .then(::this.updateState)
    .then(actions => actions.map(this.store.dispatch))
    .catch(err => {
      console.error(err);
      this.store.dispatch(StatusActions.error(err));
    });
  }

  getTickArr () {
    return [
      { method: this.ethapi.eth.blockNumber, actionMaker: StatusActions.updateBlockNumber },
      { method: this.ethapi.eth.hashrate, actionMaker: StatusActions.updateHashrate },
      { method: this.ethapi.net.peerCount, actionMaker: StatusActions.updatePeerCount },
      { method: this.ethapi.eth.accounts, actionMaker: StatusActions.updateAccounts },
      { method: this.ethapi.eth.coinbase, actionMaker: MiningActions.updateAuthor },
      { method: this.ethapi.ethcore.minGasPrice, actionMaker: MiningActions.updateMinGasPrice },
      { method: this.ethapi.ethcore.gasFloorTarget, actionMaker: MiningActions.updateGasFloorTarget },
      { method: this.ethapi.ethcore.extraData, actionMaker: MiningActions.updateExtraData },
      { method: this.ethapi.ethcore.defaultExtraData, actionMaker: MiningActions.updateDefaultExtraData },
      { method: this.ethapi.ethcore.devLogsLevels, actionMaker: DebugActions.updateDevLogsLevels },
      { method: this.ethapi.ethcore.devLogs, actionMaker: DebugActions.updateDevLogs },
      { method: this.ethapi.ethcore.netChain, actionMaker: StatusActions.updateNetChain },
      { method: this.ethapi.ethcore.netPort, actionMaker: StatusActions.updateNetPort },
      { method: this.ethapi.ethcore.netMaxPeers, actionMaker: StatusActions.updateNetMaxPeers },
      { method: this.ethapi.ethcore.rpcSettings, actionMaker: StatusActions.updateRpcSettings },
      { method: this.ethapi.ethcore.nodeName, actionMaker: StatusActions.updateNodeName }
    ];
  }

  nextDelay () {
    let noOfErrors = this.store.getState().status.noOfErrors;
    if (noOfErrors === 0) {
      return this.delay;
    }
    return this.delay * (1 + Math.log(noOfErrors));
  }

  start () {
    this.running = true;
    this.onStart();
    this.refreshTick();
    return () => { this.running = false; };
  }

  refreshTick () {
    if (!this.running) {
      return;
    }
    this.onTick().then(() => {
      setTimeout(::this.refreshTick, this.nextDelay());
    });
  }

  filterChanged (actions) {
    return actions.filter(action => {
      const val = this.state[this.actionProp(action)];

      if (isBigNumber(val)) {
        return !val.equals(action.payload);
      }

      if (isArray(val) || isObject(val)) {
        return !isEqual(val, action.payload);
      }

      return val !== action.payload;
    });
  }

  updateState (actions) {
    return actions.map(action => {
      this.state[this.actionProp(action)] = action.payload;
      return action;
    });
  }

  actionProp (action) {
    return action.type.split(' ')[1];
  }

}
