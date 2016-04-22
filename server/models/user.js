Schema = {};
/*
 * XXX After initial import from rails, we can remove railsId, and freshbooksId
 */
Schema.UserProfile = new SimpleSchema({
  harvestId: {
    type: Number,
    optional: true
  },
  railsId: {
    type: Number,
    optional: true
  },
  freshbooksId: {
    type: Number,
    optional: true
  },
  firstName: {
    type: String,
    optional: true
  },
  lastName: {
    type: String,
    optional: true
  }
});

Schema.User = new SimpleSchema({
    username: {
        type: String,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
    emails: {
        type: Array,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date,
        optional: true
    },
    profile: {
        type: Schema.UserProfile,
        optional: true
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Option 1: Object type
    // If you specify that type as Object, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Example:
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Option 2: [String] type
    // If you are sure you will never need to use role groups, then
    // you can specify [String] as the type
    roles: {
        type: [String],
        optional: true
    }
});

Meteor.users.attachSchema(Schema.User);

if( Meteor.isServer ){
  Meteor.users._ensureIndex({'profile.railsId': 1});
  Meteor.users._ensureIndex({'profile.freshbooksId': 1});
  Meteor.users._ensureIndex({'profile.harvestId': 1});
}

Meteor.users.helpers({
  update: function(modifier){
    Meteor.users.update({'_id': this._id},modifier);
  },

  totalHrsThisYear (){
    let entriesThisYear = TimeEntries.find({
      userId: this._id,
      date: {$gte: Utils.startOf('year'), $lte: Utils.endOf('year')},
    }).fetch();

    return TimeEntries.getTotalDuration(entriesThisYear);
  },

  // concessedHrsThisYear (){
  //   let concessedTaskIds = Tasks.getConcessedTaskIds();
  //   let concessedEntriesThisYear = TimeEntries.find({
  //     userId: this._id,
  //     date: {$gte: Utils.startOf('year'), $lte: Utils.endOf('year')},
  //     taskId: {$in: concessedTaskIds},
  //   }).fetch();

  //   return TimeEntries.getTotalDuration(concessedEntriesThisYear);
  // },

  totalHrsThisWeek (){
    let entriesThisWeek = TimeEntries.find({
      userId: this._id,
      date: {$gte: Utils.startOf('week'), $lte: Utils.endOf('week')},
    }).fetch();

    return TimeEntries.getTotalDuration(entriesThisWeek);
  },

  // concessedHrsThisWeek (){
  //   let concessedTaskIds = Tasks.getConcessedTaskIds();
  //   let concessedEntriesThisWeek = TimeEntries.find({
  //     userId: this._id,
  //     date: {$gte: Utils.startOf('week'), $lte: Utils.endOf('week')},
  //     taskId: {$in: concessedTaskIds},
  //   }).fetch();

  //   return TimeEntries.getTotalDuration(concessedEntriesThisWeek);
  // },

  totalHrsThisMonth (){
    let entriesThisMonth = TimeEntries.find({
      userId: this._id,
      date: {$gte: Utils.startOf('month'), $lte: Utils.endOf('month')},
    }).fetch();

    return TimeEntries.getTotalDuration(entriesThisMonth);
  },

  concessedHrsThisInterval (interval){
    let intervals = ['week', 'month', 'quarter', 'year'];

    if (! _.contains(intervals, interval)) {
      throw new Error('interval must be one of week, month, quarter, or year');
    }

    let concessedTaskIds = Tasks.getConcessedTaskIds();
    let concessedEntriesThisInterval = TimeEntries.find({
      userId: this._id,
      date: {$gte: Utils.startOf(interval), $lte: Utils.endOf(interval)},
      taskId: {$in: concessedTaskIds},
    }).fetch();

    return TimeEntries.getTotalDuration(concessedEntriesThisInterval);
  },

  totalHrsThisQuarter (){
    let entriesThisQuarter = TimeEntries.find({
      userId: this._id,
      date: {$gte: Utils.startOf('quarter'), $lte: Utils.endOf('quarter')},
    }).fetch();

    return TimeEntries.getTotalDuration(entriesThisQuarter);
  },

  billableHrsThisYear (){
    return this.totalHrsThisYear() - this.concessedHrsThisInterval('year');
  },

  billableHrsThisWeek (){
    return this.totalHrsThisWeek() - this.concessedHrsThisInterval('week');
  },

  billableHrsThisMonth (){
    return this.totalHrsThisMonth() - this.concessedHrsThisInterval('month');
  },

  billableHrsThisQuarter (){
    return this.totalHrsThisQuarter() - this.concessedHrsThisInterval('quarter');
  },

  primaryEmail (){
    return this.emails[0].address;
  },

  userName (){
    return this.services.google.given_name + "  " + this.services.google.family_name;
  },

  userPicture (){
    return this.services.google.picture;
  },

});


Meteor.users.profile = function( userId ){
  var user = Meteor.users.findOne({'_id': userId});
  if( user ){
    return user.profile;
  }
};
