Future = Npm.require('fibers/future');

harvest = new Harvest({
    subdomain: Meteor.settings.harvest.subdomain,
    email: Meteor.settings.harvest.email,
    password: Meteor.settings.harvest.password,
    throttle_concurrency: 50
});

HarvestSync = {};

/*
 *  Add fields needed for harvest integration
 */
Projects.attachSchema(new SimpleSchema({
  harvestId: {
    type: Number,
    optional: true
  }
}));
Projects._ensureIndex({harvestId: 1});

Tasks.attachSchema(new SimpleSchema({
  harvestId: {
    type: Number,
    optional: true
  }
}));
Tasks._ensureIndex({harvestId: 1});

TimeEntries.attachSchema(new SimpleSchema({
  harvestId: {
    type: Number,
    optional: true
  },
  harvestTrelloCardName: { // Used for trello title recovery. Probably can be removed
    type: String,
    optional: true
  }
}));
TimeEntries._ensureIndex({harvestId: 1});

// NOTE:  Users harvestId field is in butler2:users due to collection2 limitations

/*
 * Declare harvest to local mapping
 */

HarvestSync._projectMapping = {
  id: { mapTo: "harvestId" },
  name: { mapTo: "name" }
};

HarvestSync._taskMapping = {
  id: { mapTo: "harvestId" },
  name: { mapTo: "name" }
};

HarvestSync._userMapping = {
  id: { mapTo: "profile.harvestId" },
  email: { mapTo: "emails", mapFunc: function(val){
    return [{address: val, verified: true}];
  }}
};
HarvestSync._trelloTimeEntryMapping = {
  id: { mapTo: "harvestId" },
  notes: { mapTo: "harvestTrelloCardName" },
  external_ref: { mapTo: "trelloId", mapFunc: function(val){
    if( val ){
      return val.id;
    }
  }},
  hours: {mapTo: "duration", mapFunc: function(val){
    return (typeof(val) === "number") ? val : 0;
  }},
  spent_at: { mapTo: "date", mapfunc: function(val){
    return moment.tz( val, Meteor.settings.timezone ).toDate();
  }},
  user_id: { mapTo: "userId", mapFunc: function(val){
    let user = Meteor.users.findOne({ 'profile.harvestId': val });
    if( user ){
      return user._id;
    }else{
      console.error( "Harvest user not found" + val );
    }
  }},
  task_id: { mapTo: "taskId", mapFunc: function(val){
    if( !val ){ return; }

    let task = Tasks.findOne({ harvestId: parseInt(val) });
    if( task ){
      return task._id;
    }else{
      console.error( "Harvest task not found" + val );
    }
  }},
  project_id: { mapTo: "projectId", mapFunc: function(val){
    if( !val ){ return; }

    let project = Projects.findOne({ harvestId: parseInt(val) });
    if( project ){
      return project._id;
    }else{
      console.error( "Harvest project not found" + val );
    }
  }},
};
HarvestSync._jiraTimeEntryMapping = {
  id: { mapTo: "harvestId" },
  notes: { mapTo: "comment" },
  external_ref: { mapTo: "jiraId", mapFunc: function(val){
    if( val ){
      return val.id;
    }
  }},
  hours: {mapTo: "duration", mapFunc: function(val){
    return (typeof(val) === "number") ? val : 0;
  }},
  spent_at: { mapTo: "date", mapfunc: function(val){
    return moment.tz( val, Meteor.settings.timezone ).toDate();
  }},
  user_id: { mapTo: "userId", mapFunc: function(val){
    let user = Meteor.users.findOne({ 'profile.harvestId': val });
    if( user ){
      return user._id;
    }else{
      console.error( "Harvest user not found" + val );
    }
  }},
  task_id: { mapTo: "taskId", mapFunc: function(val){
    if( !val ){ return; }

    let task = Tasks.findOne({ harvestId: parseInt(val) });
    if( task ){
      return task._id;

    }else{
      console.error( "Harvest task not found" + val );
    }
  }},
  project_id: { mapTo: "projectId", mapFunc: function(val){
    if( !val ){ return; }

    let project = Projects.findOne({ harvestId: parseInt(val) });
    if( project ){
      return project._id;
    }else{
      console.error( "Harvest project not found" + val );
    }
  }},
};

HarvestSync._convert = function(doc, mapping){
  let newDoc = {};
  _.each(mapping,function( val,key ){
    if( doc.hasOwnProperty(key) ){
      if( val.mapFunc ){
        newDoc[ val.mapTo ] = val.mapFunc( doc[key] )
      }else{
        newDoc[ val.mapTo ] = doc[key];
      }
    }
  });
  return newDoc;
};

HarvestSync._convert2 = function(doc, mapping, callback){
  let newDoc = {};
  _.each(mapping,function( val,key ){
    if( doc.hasOwnProperty(key) ){
      if( val.mapFunc ){
        newDoc[ val.mapTo ] = val.mapFunc( doc[key] )
      }else{
        newDoc[ val.mapTo ] = doc[key];
      }
    }
  });
  callback(newDoc);
};

/*
 * Setup sync definitions
 */

HarvestSync.importProjects = function(callback){
  harvest.Projects.list({},Meteor.bindEnvironment(function(err, resp){
    _.each(resp, function(singleProject){
      let harvestProject = singleProject.project;
      let doc = HarvestSync._convert( harvestProject, HarvestSync._projectMapping );
      Projects.upsert({harvestId: doc.harvestId},{$set: doc});
    });
    console.log( "Harvest: Import Projects complete" );
    if( callback ){ callback() };
  }));
};

HarvestSync.importTasks = function( callback ){
  harvest.Tasks.list({},Meteor.bindEnvironment(function(err, resp){
    _.each(resp, function(singleTask){
      let harvestTask = singleTask.task;
      let doc = HarvestSync._convert( harvestTask, HarvestSync._taskMapping );
      Tasks.upsert({harvestId: doc.harvestId},{$set: doc});
    });
    console.log( "Harvest: Import Tasks complete" );
    if( callback ){ callback() };
  }));
};

HarvestSync.importUsers = function( callback ){
  harvest.People.list({},Meteor.bindEnvironment(function(err, resp){
    _.each(resp, function(singleStaff){
      let harvestStaff = singleStaff.user;
      let doc = HarvestSync._convert( harvestStaff, HarvestSync._userMapping );
      Meteor.users.upsert({
        'emails': { $elemMatch: {'address': harvestStaff.email.toLowerCase() }}
      },{$set: doc});
    });
    console.log( "Harvest: Import Users complete" );
    if( callback ){ callback() };
  }));
};

HarvestSync._handleTimeEntryDeletions = function(resp, date, userId, callback){
  // TODO double check timezone handling
  let fromDate = moment.tz( date, Meteor.settings.timezone ).startOf('day');
  let toDate = moment.tz( date, Meteor.settings.timezone ).endOf('day');

  /*
   * Create hash of all harvest IDs in date/time range
   */
  let existanceHash = {};
  TimeEntries.find({
    userId: userId, date: {$lte: toDate.toDate(), $gt: fromDate.toDate()}
  }).forEach(function(te){
    existanceHash[ te.harvestId ] = true;
  });

  /*
   * Remove all returned items from the hash
   */
  _.each( resp.day_entries, function( singleEntry ){
    delete existanceHash[ singleEntry.id ];
  });

  /*
   * Delete any remaining harvest ids
   * Harvest IDS remaining in the hash have a record locally, but not in harvest
   */
  var removeIds = _.keys( existanceHash ).map( id => parseInt(id) );
  TimeEntries.remove({'harvestId': {$in: removeIds}}, function(err,res){
    if (callback) {callback();}
  });
};

/*
 *  Passed in a set of tasks, wait for one to succeed before continueing
 *  This is needed due to constantly hitting harvests throttling.
 *
 *  If we hit the throttling limit, retry the same task, until max-retries
 *
 *  If successful move on to next task
 */

HarvestSync._importTimeEntries = function( user, date, retries, callback ){
  let self = this;
  harvest.TimeTracking.daily({
      date: date.toDate(), of_user: user.profile.harvestId
    },Meteor.bindEnvironment(function(err, resp){
      if( err ){
        console.log( "Fail " + date + " " + user.emails[0].address + " : " + err );
        if( callback ){ callback() };
      }else{
        //console.log(resp.for_day);
        //console.log( "Success " + date + " " + user.emails[0].address );
        HarvestSync._handleTimeEntryDeletions( resp, date, user._id, function() {

          var doc = {};
          var docs = _.map( resp.day_entries, function(entry){
              if (isNaN(entry.external_ref.id) === false) {
                doc = HarvestSync._convert( entry, HarvestSync._jiraTimeEntryMapping );
              } else {
                doc = HarvestSync._convert( entry, HarvestSync._trelloTimeEntryMapping );
              }
              return doc;
          });

          if (docs.length > 0) {
            TimeEntries.batchInsert(docs, function( err, res){
              console.log(err);
              console.log(res);
              if ((res || err) && callback) { callback();}
            });
          } else {
            if (callback) { callback();}
          }
        });
      }

    })
  );
};

HarvestSync.importTimeEntries = function( callback ){
  let self = this;
  let fromDate = moment().add(-Meteor.settings.harvest["import-days-ago"], 'days');
  let toDate = moment();

  let tasks = [];
  let users = Meteor.users.find({'profile.harvestId': {$exists: true}});
  let usersCount = users.count();
  users.forEach(function(user, i){
    for( let date = fromDate.clone(); date.isBefore( toDate ); date.add(1,'days') ){
      // pass off the callback to the last one
      if( (usersCount-1 === i) && !date.clone().add(1,'days').isBefore( toDate ) ){
        self._importTimeEntries( user, date.clone(), 0, function(){
          console.log( "Harvest: Import Time Entries complete" );
          if (callback) {callback();}
          //Meteor.setTimeout(function() {if (callback) {callback()};}, 25000);
        })
      }else{
        self._importTimeEntries( user, date.clone(), 0, undefined )
      }
    }
  });
};

HarvestSync.importAll = function( callback ){
  var self = this;
  self.importProjects(function(){
    self.importUsers(function(){
      self.importTasks(function(){
        TimeEntries.remove({}, function() {

          self.importTimeEntries(callback);
        });
      });
    });
  })
};
