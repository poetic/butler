import React, { Component } from 'react';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
HighchartsMore(ReactHighcharts.Highcharts);
import CircularProgress from 'material-ui/CircularProgress';


export default class LineChart extends Component {

  getChartConfig(timeEntries) {

    const numDays = moment().isLeapYear() ? 366 : 365;
    const daysSoFar = moment().dayOfYear();
  //  const timeEntries = this.props.timeEntries;

    // Construct The Curve
    let theCurve = [];
    let curveRunningTotal = 0;
    for (let i = 0; i < daysSoFar - 1; i++) {
      curveRunningTotal += 1617 / numDays;
      theCurve.push([i, curveRunningTotal]);
    }

    // Construct Progress line
    const totalsPerDay = {};

    for (let i = 0; i < daysSoFar - 1; i++) {
      totalsPerDay[i] = 0;
    }

    // For each time entry, increase duration of corresponding day entry in
    // totalsPerDay.
    timeEntries.forEach((timeEntry) => {
      dayOfYear = moment(timeEntry.date).dayOfYear();
      totalsPerDay[dayOfYear] += timeEntry.duration;
      console.log(timeEntry.duration);
      console.log(totalsPerDay);
    });

    // construct an array, which is consumed by highcharts. Create a running
    // total of hours worked.
    let dataArray = [];
    let runningTotal = 0;
    for (let prop in totalsPerDay) {
      if (totalsPerDay.hasOwnProperty(prop)) {
        runningTotal += totalsPerDay[prop];
        dataArray.push([parseInt(prop), runningTotal]);
      }
    }

    const config = {
      title: {
        text: 'PTO Tracker',
        x: -20, // center
      },
      plotOptions: {
        line: {
          marker: {
            enabled: false,
          },
        },
      },
      xAxis: {
        title: {
          text: 'Day of Year',
        },
        allowDecimals: false,
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Hours',
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080',
        }],
        allowDecimals: false,
      },
      tooltip: {
        formatter: function () {
          const seriesName = this.point.series.name;
          const numHours = this.point.y.toFixed(1);
          const date = moment().dayOfYear(this.point.x);

          return `${date.format('MMM Do')}<br />${numHours} hours`;
        },
      },
      credits: {
        enabled: false,
      },
        // legend: {
        // layout: 'vertical',
        // align: 'right',
        // verticalAlign: 'middle',
        // borderWidth: 0
        // },
      series: [{
        name: 'The Curve',
        data: theCurve,
        dashStyle: 'longDash',
      }, {
        name: 'Current Progress',
        data: dataArray,
      }],
    };
    return config;
  }

  render() {

    let { timeEntries } = this.props;
    if (timeEntries) {
      console.log(timeEntries);
      return (
          <ReactHighcharts config={this.getChartConfig(timeEntries)} />
      );
    } else {
      return (<CircularProgress size={1.5} />);
    }




    return (
      <ReactHighcharts config={config} />
    );
  }
}
