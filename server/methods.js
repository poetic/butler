
Meteor.startup(() => {

  if (Meteor.isServer){


    Meteor.methods({

      createMeteorUser: function(data) {
        return Accounts.createUser({email: data.user.email, fromWorker: true});
  	  }
    })
  }
});
