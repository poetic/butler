import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import LineChart from './LineChart.jsx';
import { createContainer } from 'meteor/react-meteor-data';

const style = {
  margin: '30px'
}

class LineChartCard extends Component {

  render() {
    return (
      <Card style={style}>
        <CardMedia>
          <LineChart timeEntries={this.props.timeEntries} />
        </CardMedia>
        <CardTitle title="Card title" subtitle="Card subtitle" />
        <CardActions>
        </CardActions>
      </Card>
    )
  }
}

export default createContainer(() => {
  let handle = Meteor.subscribe("TimeEntries.all");
  return {
    timeEntries: TimeEntries.find().fetch(),
  };
}, LineChartCard);
