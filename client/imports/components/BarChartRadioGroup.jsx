import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';


const style = {
  display: 'inline-block',
  width: '150px'
}

export default class BarChartRadioGroup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      period: "week"
    }
  }

  _toggleRadioButton(event, value) {
    this.props.toggle(value)
    this.setState({
      period: value
    })
  }

  render() {
    return (
      <RadioButtonGroup name="period" valueSelected={this.state.period} defaultChecked={this.state.period} onChange={this._toggleRadioButton.bind(this)}>
        <RadioButton
          value="week"
          label="Week"
          style={style}
        />
        <RadioButton
          value="month"
          label="Month"
          style={style}
        />
        <RadioButton
          value="year"
          label="Year"
          style={style}
        />
      </RadioButtonGroup>
    )
  }
}
