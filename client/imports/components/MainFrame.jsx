import React, {Component} from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

export default class MainFrame extends Component {

  render() {
    return (

      <MuiThemeProvider muiTheme={getMuiTheme()}>
        {this.props.children}
      </MuiThemeProvider>
    );
  }
}
