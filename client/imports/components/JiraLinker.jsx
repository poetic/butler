import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import { Router, browserHistory} from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';

const style = {
  marginTop: '50px'
}


export default class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      url: '',
      token: '',
      tokenSecret: '',
      oauthVerifier: '',
      accessToken: '',
      step: 1
    }
  }

  handleTextChange(e){
    this.setState({oauthVerifier: e.target.value});
  }

  getAuthorizeURL() {
    var _this = this;
    this.setState({step: 2});


    Meteor.call('getAuthorizeURL', function(error, res){

      _this.setState({
        url: res.url,
        token: res.token,
        tokenSecret: res.token_secret
      })

    });
  }

  swapRequestTokenWithAccessToken() {
    var _this = this;
    var token = this.state.token;
    var tokenSecret = this.state.tokenSecret;
    var oauthVerifier = this.state.oauthVerifier;

    Meteor.call('swapRequestTokenWithAccessToken', token, tokenSecret, oauthVerifier, function(error, res){
      _this.setState({
        accessToken: res
      })

      Meteor.call('setAccessToken', _this.state.accessToken, _this.state.tokenSecret, Meteor.userId(), function(error, res) {
        console.log(res);
        if (res) {
          browserHistory.push('/');
        }
      });
    });
  }

  renderStepOne() {
    if (this.state.step === 1) {
      return <RaisedButton label="Get Authorize URL" onClick={this.getAuthorizeURL.bind(this)} />
    }
  }

  renderStepTwo() {
    if (this.state.step === 2) {
      if (this.state.url.length > 0) {
        return (
          <div className="center-block">
            <p> Click on <a target="_blank" href={this.state.url}> THIS </a> link and copy the authentication code in the field below</p>
            <TextField hintText="Paste auth code here" value={this.state.oauthVerifier} onChange={this.handleTextChange.bind(this)}/>
            <div className="row center-block">
              <RaisedButton label="Get Access Token" onClick={this.swapRequestTokenWithAccessToken.bind(this)} />
            </div>
          </div>
        )
      } else {
        return (
          <CircularProgress size={1.5}/>
        )
      }

    }
  }

  render() {
    // Just render a placeholder container that will be filled in
    return (
      <div className="container" style={style}>
        <div className="col-md-6 col-md-offset-4">
          {this.renderStepOne()}
          {this.renderStepTwo()}
        </div>
      </div>
    );
  }
}
