import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
HighchartsMore(ReactHighcharts.Highcharts)
import CircularProgress from 'material-ui/CircularProgress';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';


export default class BarChart extends Component {

  getChartConfig() {
      let { user } = this.props;
      let billable = Math.round(user.billableHrsThisWeek());
      let concessed = Math.round(user.concessedHrsThisInterval('month'));
      let billableTimePeriod = this.props.value;
      // let month = Math.round(user.billableHrsThisMonth());
      // let quarter = Math.round(user.billableHrsThisQuarter());
      // console.log('month', month);
      // console.log('quarter', quarter);

        //default selection on the title
        
        //set the data according to the time period
      if (billableTimePeriod === 'month'){
        billable = Math.round(user.billableHrsThisMonth());
        concessed = Math.round(user.concessedHrsThisInterval('month'));
      } else if (billableTimePeriod === 'quarter'){
        billable = Math.round(user.billableHrsThisQuarter());
        concessed = Math.round(user.concessedHrsThisInterval('quarter'));
      }
      let max = billable + concessed;

    const config = {
      chart: {
        type: 'bar',
      },
      title: {
        text: 'You’ve logged ' + "<span>" +[max] + ' hours </span> this '+[billableTimePeriod]
      },
      marker: {
          symbol: 'circle'
      },
      legend: {
        symbolRadius: 10,
        symbolHeight: 15
      },
      xAxis: {
        gridLineWidth: 0,
        title: {
          text: ''
        },
        labels: {
          enabled: false
        },
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0
      },
      yAxis: {
        max: [max],
        tickInterval: 1,
        gridLineWidth: 0,
        reversedStacks: false,
        title: {
          text: ''
        },
        labels: {
          enabled: false
        }
      },
      plotOptions: {
        series: {
          stacking: 'normal'
        }
      },
      labels: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      series: [{
        name: 'Billable Hours',
        data: [billable],
        pointWidth: 60,
        color: '#394154',
        dataLabels: {
          enabled: true,
          color: '#FFFFFF',
          align: 'center',
          style: {
            fontSize: '34px',
            fontFamily: 'Lato, sans-serif',
            fontWeight: '200',
            textShadow: 'none'
          },
          formatter: function() {
            if (this.series.data[0].y != 0) {
              return this.series.data[0].y;
            } else {
              return null;
            }
          }
        }
      }, {
        name: 'Concessions',
        data: [concessed],
        pointWidth: 60,
        color: '#F5A623',
        dataLabels: {
          enabled: true,
          color: '#FFFFFF',
          align: 'center',
          style: {
            fontSize: '34px',
            fontFamily: 'Lato, sans-serif',
            fontWeight: '200',
            textShadow: 'none'
          },
          formatter: function() {
            if (this.series.data[0].y != 0) {
              return this.series.data[0].y;
            } else {
              return null;
            }
          }
        }
      }]
    };
    return config;
  }

  render() {
    let { user } = this.props;
    if (user) {
      return (
          <ReactHighcharts config = {this.getChartConfig(user)} />
      )
    } else {
      return (<CircularProgress size={1.5}/>);
    }
  }
}
