import { Accounts } from 'meteor/accounts-base';

Accounts.onCreateUser((options, user) => {
  console.log(user);
  if (user.fromWorker) {
    console.log("FROM WORKER");
  }
  /*
      // restore default behavior
    if (options.profile) { user.profile = options.profile }

      // return user being created by harvest sync
    if (! user.services) { return user }

    let service = _.keys(user.services)[0];
    let { email } = user.services[service];
    let harvestUser = Meteor.users.findOne({'emails.address': email});

      // new employee that doesn't yet have harvest info
    if (! harvestUser) { throw new Meteor.Error('cannot log in', 'cannot log in') }

      // attach servies to existing harvest user
    if (! harvestUser.services) {
      harvestUser.services = {
        resume: {loginTokens: []},
        [`${service}`]: user.services[service],
      };
    }

      // remove the existing harvest user and return the user object to
      // let the accounts service reinsert
    Meteor.users.remove({_id: harvestUser._id});
    return harvestUser;*/
    return user;

});
