import { Router, Route, browserHistory, IndexRoute } from 'react-router'
import React, {Component} from 'react';
import MainFrame from './imports/components/MainFrame.jsx';
import Login from './imports/components/Login.jsx';
import Dashboard from './imports/components/Dashboard.jsx';
import JiraLinker from './imports/components/JiraLinker.jsx';



export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/" component={MainFrame}>
      <IndexRoute component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="jiraLinker" component={JiraLinker} />
    </Route>
  </Router>
);
