import { Meteor } from 'meteor/meteor';
var JiraClient = require('jira-connector');
Future = Npm.require('fibers/future');

Meteor.methods({
  getAuthorizeURL() {

    var future = new Future();

    JiraClient.oauth_util.getAuthorizeURL({
      host: Meteor.settings.jira.host,
      oauth: {
        consumer_key: Meteor.settings.jira.consumerKey,
        private_key: Meteor.settings.jira.privateKey,
      },
    }, function (error, res) {
      future.return(res);
    });
    return future.wait();
  },

  swapRequestTokenWithAccessToken(token, tokenSecret, oauthVerifier) {

    var future = new Future();

    JiraClient.oauth_util.swapRequestTokenWithAccessToken({
      host: Meteor.settings.jira.host,
      oauth: {
        token: token,
        token_secret: tokenSecret,
        oauth_verifier: oauthVerifier,
        consumer_key: Meteor.settings.jira.consumerKey,
        private_key: Meteor.settings.jira.privateKey,
      },
    }, function (error, res) {
      future.return(res);
    });
    return future.wait();
  },

  setAccessToken(accessToken, tokenSecret, userId) {
    var future = new Future();

    Meteor.users.update({ _id: userId }, { $set: { 'profile.accessToken': accessToken, 'profile.tokenSecret': tokenSecret } }, function (err, res) {
      console.log(err);

      future.return(res);
    });
    return future.wait();
  },
});
