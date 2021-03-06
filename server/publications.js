import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

  Meteor.publish('TimeEntries.all', function() {
    if (this.userId) {
      return TimeEntries.find();
    }
    return this.ready();
  });


  Meteor.publish('Users.me', function() {
    if (this.userId) {
      return this.user;
    }
    return this.ready();
  });
});
