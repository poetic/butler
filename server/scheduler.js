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

var workers = Job.processJobs('jobs', 'import',
  function (job, callback) {

    HarvestSync.importAll(function() {
        JiraSync.update();
    //  TrelloSync.update();
    });


    job.done();
    callback();
  }
);



/*if( Meteor.settings['sync-trello-harvest'] ){
  SyncedCron.add({
    name: 'Import from harvest, export to trello',
    schedule: function(parser) {
      // parser is a later.parse object
      return parser.text(Meteor.settings['sync-trello-harvest']);
    },
    job: function() {
      HarvestSync.importAll( function(){
        Meteor.setTimeout(function(){
          TrelloSync.update();
        },20*60*1000)
      });
    }
  });

  SyncedCron.start();
}*/



/*
console.log("PROJECTS: "+Projects.find({}).count());
console.log("TASKS: "+Tasks.find({}).count());
console.log("USERS: "+Meteor.users.find({}).count());*/
/*
console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
var x = TimeEntries.find({}).fetch();
console.log(x.length);
console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

});
*/

/*
* 1,6,1,20
* 1,6,1,20
* 1,6,1,19
* 1,6,1,7
* 1,6,1,11
* 1,6,1,20
* 1,6,1,14
* 1,6,1,12
* 1,6,1,3
* 1,6,1,6
* 1,6,1,14
* 1,6,1,13
* 1,6,1,20
* 1,6,1,11
*/
