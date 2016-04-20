
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Status from '../../components/Status';
import * as ModifyMiningActions from '../../actions/modify-mining';
import style from './style.css';

class StatusPage extends Component {

  render () {
    const {status} = this.props;

    return (
      <div className={style.normal}>
        <Header
          nodeName={status.name}
          disconnected={status.disconnected}
        />
        <Status {...this.props} />
        <Footer version={status.version} />
      </div>
    );
  }
}
StatusPage.propTypes = {
  status: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  mining: PropTypes.object.isRequired
};

function mapStateToProps (state) {
  return state;
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(ModifyMiningActions, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StatusPage);