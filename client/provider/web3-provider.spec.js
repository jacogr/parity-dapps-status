import sinon from 'sinon';
import Web3Provider from './web3-provider';
import * as StatusActions from '../actions/status';

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
        hashrate: sinon.spy(),
        blockNumber: sinon.spy(),
        coinbase: sinon.spy()
      },
      ethcore: {
        minGasPrice: sinon.spy(),
        gasFloorTarget: sinon.spy(),
        extraData: sinon.spy()
      },
      net: {
        peerCount: sinon.spy()
      },
      web3: {
        clientVersion: sinon.spy()
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
    expect(ethapi.eth.blockNumber.called).to.be.true;

    [ethapi.eth.hashrate, ethapi.eth.coinbase, ethapi.net.peerCount]
      .map((method) => {
        expect(method.called).to.be.false;
      });
  });
});
