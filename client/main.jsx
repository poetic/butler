import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import {renderRoutes} from './routes.jsx';
import Accounts from './imports/startup/accounts-config.js';


Meteor.startup(() => {
  render(renderRoutes(), document.getElementById('render-target'));
});
