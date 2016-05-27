import { Meteor } from 'meteor/meteor';
import configure from './configure-google.js';

Meteor.startup(() => {
  configure();
});
