import sinon from 'sinon';
import WebInteractions from './user-web3-interactions';
import * as MiningActions from '../actions/modify-mining';

describe('MIDDLEWARE: WEB3 INTERACTIONS', () => {
  let cut;

  beforeEach('Mock cut', () => {
    const ethapi = {
      ethcore: {
        setExtraData: sinon.spy()
      }
    };
    cut = new WebInteractions(ethapi);
  });

  it('should get correct function names', () => {
    expect(cut.getMethod('modify minGasPrice')).to.equal('setMinGasPrice');
  });

  it('should not invoke ethapi when a non modify action is dispatched', () => {
    // given
    const store = null;
    const next = sinon.spy();
    const middleware = cut.toMiddleware()(store)(next);
    const action = { type: 'testAction', payload: 'testPayload' };
    expect(middleware).to.be.a('function');
    expect(action).to.be.an('object');

    // when
    middleware(action);

    // then
    expect(next.calledWith(action)).to.be.true;
    Object.keys(cut.ethapi.ethcore).map((func) => {
      expect(cut.ethapi.ethcore[func].notCalled).to.be.true;
    });
  });

  it('should invoke ethapi when a modify action is dispatched', () => {
    // given
    const extraData = 'Parity';
    const store = null;
    const next = sinon.spy();
    const middleware = cut.toMiddleware()(store)(next);
    const action = MiningActions.modifyExtraData(extraData);
    expect(middleware).to.be.a('function');
    expect(action).to.be.an('object');

    // when
    middleware(action);

    // then
    expect(
      cut.ethapi.ethcore[cut.getMethod('modify extraData')]
      .calledWith(action.payload)
    ).to.be.true;
    expect(action.type).to.equal('update extraData');
    expect(next.calledWith({
      type: 'update extraData',
      payload: extraData
    })).to.be.true;
  });
});
