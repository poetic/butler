import React from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import AppBar from 'material-ui/AppBar';

const darkMuiTheme = getMuiTheme(darkBaseTheme);

const MainFrame = (props) => (
  <MuiThemeProvider muiTheme={darkMuiTheme}>
    <div>
      <AppBar title="Butler" />
    {props.children}
    </div>
  </MuiThemeProvider>
);

MainFrame.propTypes = {
  children: React.PropTypes.object,
};

export default MainFrame;
