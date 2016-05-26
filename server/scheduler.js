import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';


Jobs = new JobCollection('jobs');
Jobs.allow({ admin: () => true });

Meteor.startup(() => {
  // If there are no users in the db, add one

  // Start the job queue running
  Jobs.startJobServer();

  // Create new job on startup
  const job = new Job(Jobs,'import', {}).save();
});
