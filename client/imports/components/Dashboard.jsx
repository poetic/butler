import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Router, browserHistory} from 'react-router';
import LineChartCard from './LineChartCard.jsx';
import BarChartCard from './BarChartCard.jsx';
import PieChartCard from './PieChartCard.jsx';
import CircularProgress from 'material-ui/CircularProgress';

class Dashboard extends Component {
  componentDidMount() {
  /*  let { user } = this.props;

    if (user){
      browserHistory.push('/login');
    } else if (user.profile.accessToken == null){
      browserHistory.push('/jiraLinker');
    }*/
  }

  render() {
    // Just render a placeholder container that will be filled in
    let { user } = this.props;
      return (
        <div className="row">
        <div className="col-md-4">
          <LineChartCard />
          </div>
          <div className="col-md-4">

          <BarChartCard user={user}/>
          </div>

          <div className="col-md-4">

          <PieChartCard user={user}/>
          </div>

        </div>
      );
  }
}

export default createContainer(() => {
  return {
    user: Meteor.user(),
  };
}, Dashboard);
