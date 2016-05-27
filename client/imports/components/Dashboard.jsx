import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router';

class Dashboard extends Component {
  componentDidMount() {
    const { user } = this.props;

    if (!user) {
      browserHistory.push('/login');
    } else if (user.profile.accessToken == null) {
      browserHistory.push('/jiraLinker');
    }
  }

  render() {
    const { user } = this.props;

    return (
      <div>{user}</div>
    );
  }
}

export default createContainer(() => (
  { user: Meteor.user() }
), Dashboard);

Dashboard.propTypes = {
  user: React.PropTypes.object,
};
