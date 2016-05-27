import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';


Jobs = new JobCollection('jobs');
Jobs.allow({ admin: () => true });

Meteor.startup(() => {
  Jobs.startJobServer();

  const job = new Job(Jobs, 'import', {}).save();
});
