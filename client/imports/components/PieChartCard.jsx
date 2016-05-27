import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import PieChart from './PieChart.jsx';

const style = {
  margin: '30px',
};

export default class PieChartCard extends Component {

  render() {
    return (
      <Card style={style}>
        <CardMedia>
          <PieChart user={this.props.user} />
        </CardMedia>
        <CardTitle title="Card title" subtitle="Card subtitle" />
        <CardActions>
        </CardActions>
      </Card>
    );
  }
}
