
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import style from './style.css';

class AccountsPage extends Component {
  render () {
    const {status} = this.props;
    return (
      <div className={style.normal}>
        <Header
          nodeName={status.name}
          disconnected={status.disconnected}
          noOfErrors={status.noOfErrors}
        />
        <div className='dapp-flex-content'>
          <main className='dapp-content'>
            <h1>Accounts</h1>
          </main>
        </div>
        <Footer version={this.props.status.version} />
      </div>
    );
  }
}
AccountsPage.propTypes = {
  status: PropTypes.object.isRequired
};

function mapStateToProps (state) {
  return state;
}

function mapDispatchToProps (dispatch) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountsPage);
