import React, {Component} from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import AppBar from 'material-ui/AppBar';

const darkMuiTheme = getMuiTheme(darkBaseTheme);


export default class MainFrame extends Component {

  render() {
    return (

      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div>
          <AppBar
              title="POETIC LINKER"
            />
        {this.props.children}

        </div>

      </MuiThemeProvider>
    );
  }
}
