import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import { Router, browserHistory} from 'react-router';
import LineChart from './LineChart.jsx';

export default class Dashboard extends Component {

  componentDidMount() {
    if (Meteor.user() == null){
      browserHistory.push('/login');
    } else if (Meteor.user().profile.accessToken == null){
      browserHistory.push('/jiraLinker');
    }
  }

  render() {
    // Just render a placeholder container that will be filled in
    return (

        <div>
          <LineChart />
        </div>
    );
  }
}
