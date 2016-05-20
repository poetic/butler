import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import LineChart from './LineChart.jsx';

const style = {
  margin: '30px'
}

export default class LineChartCard extends Component {

  render() {
    return (
      <Card style={style}>
        <CardMedia>
          <LineChart />
        </CardMedia>
        <CardTitle title="Card title" subtitle="Card subtitle" />
        <CardActions>
        </CardActions>
      </Card>
    )
  }
}
