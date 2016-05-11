import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import { Router, browserHistory} from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';


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
    Meteor.call('getAuthorizeURL', function(error, res){

      _this.setState({
        url: res.url,
        token: res.token,
        tokenSecret: res.token_secret,
        step: 2
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
    });
  }

  renderStepOne() {
    if (this.state.step === 1) {
      return <RaisedButton label="Primary" onClick={this.getAuthorizeURL.bind(this)} />
    }
  }

  renderStepTwo() {
    if (this.state.step === 2) {
      return (
        <div>
          <p> Click on <a target="_blank" href={this.state.url}> THIS </a> link and copy the authentication code in the field below</p>
          <TextField hintText="Hint Text" value={this.state.oauthVerifier} onChange={this.handleTextChange.bind(this)}/>
          <RaisedButton label="Primary" onClick={this.swapRequestTokenWithAccessToken.bind(this)} />
        </div>
      )
    }
  }



  render() {
    // Just render a placeholder container that will be filled in
    console.log(this.state);
    return (
      <div>
        {this.renderStepOne()}
        {this.renderStepTwo()}
      </div>
    );
  }
}
