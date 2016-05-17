
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { extend } from 'lodash';
import './style.css';
import * as RpcActions from '../../actions/rpc';
import { updateLogging } from '../../actions/logger';
import { copyToClipboard } from '../../actions/clipboard';

class RpcPage extends Component {

  render () {
    return (
      <div>
        {this.props.children && React.cloneElement(this.props.children, {
          ...this.props
        })}
      </div>
    );
  }

}

function mapStateToProps (state) {
  return state;
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(extend({}, RpcActions, {copyToClipboard}, {updateLogging}), dispatch)
  };
}

RpcPage.propTypes = {
  children: PropTypes.object.isRequired,
  rpc: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RpcPage);