import sinon from 'sinon';
import Web3Provider from './web3-provider';
import * as StatusActions from '../actions/status';

import 'sinon-as-promised';

describe('WEB3 PROVIDER', () => {
  let cut;
  let state;
  let ethapi;

  beforeEach('mock Web3Provider', () => {
    state = {
      status: {
        noOfErrors: 0
      }
    };
    ethapi = {
      eth: {
        hashrate: sinon.stub().resolves(1),
        blockNumber: sinon.stub().resolves(1),
        coinbase: sinon.stub().resolves(1)
      },
      ethcore: {
        minGasPrice: sinon.stub().resolves(1),
        gasFloorTarget: sinon.stub().resolves(1),
        extraData: sinon.stub().resolves(1)
      },
      net: {
        peerCount: sinon.stub().resolves(1)
      },
      web3: {
        clientVersion: sinon.stub().resolves(1)
      }
    };

    const store = {
      dispatch: sinon.spy(),
      getState: () => state
    };

    cut = new Web3Provider(ethapi, store);
  });

  it('should get action from action type', () => {
    // given
    const action = StatusActions.updatePeerCount(20);

    // then
    expect(cut.actionProp(action)).to.equal('peerCount');
  });

  it('should get this.delay when no errors', () => {
    // given
    state.status.noOfErrors = 0;

    // then
    expect(cut.nextDelay()).to.equal(cut.delay);
  });

  it('should get result higher this.delay when there are errors', () => {
    // given
    state.status.noOfErrors = 10;

    // then
    expect(cut.nextDelay()).to.be.above(cut.delay);
  });

  it('should call only single method when you are disconnected', () => {
    // given
    state.status.disconnected = true;

    // when
    cut.onTick();

    // then
    expect(ethapi.eth.blockNumber.calledOnce).to.be.true;

    [ethapi.eth.hashrate, ethapi.eth.coinbase, ethapi.net.peerCount]
      .map((method) => {
        expect(method.calledOnce).to.be.false;
      });
  });
});
