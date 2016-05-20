import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import {renderRoutes} from './routes.jsx';
import Accounts from './imports/startup/accounts-config.js';
import injectTapEventPlugin from 'react-tap-event-plugin';

Meteor.startup(() => {
  injectTapEventPlugin();
  render(renderRoutes(), document.getElementById('render-target'));
});
