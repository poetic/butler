import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import { Router, browserHistory} from 'react-router';

export default class Dashboard extends Component {

  componentDidMount() {

    if (!Meteor.user()){
      browserHistory.push('/login');
    } else if (!Meteor.user.token){
      browserHistory.push('/jiraLinker');
    }
  }

  render() {
    // Just render a placeholder container that will be filled in
    return (

        <div>
          Dashboard
        </div>
    );
  }
}
