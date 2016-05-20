import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import BarChart from './BarChart.jsx';
import BarChartRadioGroup from './BarChartRadioGroup.jsx';

const style = {
  margin: '30px'
}

export default class BarChartCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      childValue: "week"
    }
  }

  handleToggle(childValue) {
    this.setState({
      childValue: childValue
    })
  }

  render() {
    return (
      <Card style={style}>
        <CardMedia>
          <BarChart user={this.props.user} value={this.state.childValue}/>
        </CardMedia>
        <CardTitle title="Card title" subtitle="Card subtitle" />
        <CardActions>
          <BarChartRadioGroup toggle={this.handleToggle.bind(this)} />
        </CardActions>
      </Card>
    )
  }
}
