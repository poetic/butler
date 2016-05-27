import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
HighchartsMore(ReactHighcharts.Highcharts);
import CircularProgress from 'material-ui/CircularProgress';

export default class PieChart extends Component {

  getChartConfig(user) {
    let hours = user.totalHrsThisYear();
    console.log(hours);
    let date = new Date();
    let currentYear = moment(date).format('YYYY');
    let totalHours = Math.round((hours / 1617) * 100);
    let footer = Math.round(hours);
    var categories = ['Billable', 'Remaining'];
    var data = [{
      y: 56.33,
      drilldown: {
        name: 'Billable Hours',
        categories: ['Billable', 'Remaining'],
        data: [hours, 1617 - hours],
      },
    }];
    var browserData = [],
      hoursData = [], i, j,
      dataLen = data.length,
      drillDataLen,
      brightness;

// Build the data arrays
    for (i = 0; i < dataLen; i += 1) {

   // add browser data
      browserData.push({
        name: categories[i],
        y: data[i].y,
      });

   // add version data
      drillDataLen = data[i].drilldown.data.length;
      for (j = 0; j < drillDataLen; j += 1) {
        hoursData.push({
          name: data[i].drilldown.categories[j],
          y: data[i].drilldown.data[j],
          color: j == 0 ? '#394154' : '#f3f3f3',
        });
      }
    }

    const config = {
      chart: {
        type: 'pie',
      },
      title: {
        text: currentYear + ' Billable Hours Progress',
      },
      subtitle: {
        text: totalHours + '%',
        align: 'center',
        verticalAlign: 'middle',
        style: {
          'fontSize': '30px',
        },
        y: 25,
      },
      yAxis: {
        title: {
          text: 'Total percent market share',
        },
      },
      plotOptions: {
        pie: {
          shadow: false,
          center: ['50%', '50%'],
          states: {
            hover: {
              brightness: 0,
            },
          },
        },
      },
      credits: {
        position: {
          align: 'center',
        },
        text: [footer] + '/1617 BILLABLE HOURS',
        href: null,
        position: {
          align: 'center',
          verticalAlign: 'bottom',
        },
        style: {
          fontSize: '16px',
          fontFamily: 'Lato',
          cursor: 'initial',
          textTransform: 'uppercase',
          color: '#394154',
          letterSpacing: '2px',
          fontWeight: 'bold',
          paddingBottom: '20px',
        },
      },
      series: [{
        name: 'Hours',
        data: hoursData,
        size: '80%',
        innerSize: '60%',
      }],
    };
    return config;
  }

  render() {
    let { user } = this.props;
    if (user) {
      return (
        <ReactHighcharts config={this.getChartConfig(user)} />
      );
    } else {
      return (<CircularProgress size={1.5} />);
    }

  }
}
