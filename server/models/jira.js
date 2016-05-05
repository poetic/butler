var JiraClient = require('jira-connector'); //hPiAIA
Future = Npm.require('fibers/future');

TimeEntries.attachSchema(new SimpleSchema({
  jiraId: {
    type: String,
    optional: true
  }
}));

JiraSync = {
  jira: new JiraClient({
      host: Meteor.settings.jira.host,
      oauth: {
          token: '1y2OCuqndd5f4kKODH2yjYvjrkCmcPGE',
          token_secret: 'ZqHnZACdIIX7ZqH3ctdMjbRp8LQHpl41',
          consumer_key: Meteor.settings.jira.consumerKey,
          private_key: Meteor.settings.jira.privateKey
      }
  }),

  _getAllWorklogs(id, callback) {
    this.jira.issue.getWorkLogs({
        issueId: id
    }, function(error, res) {
      callback(res);
    });
  },

  _addWorklog(id, worklog, callback) {
    this.jira.issue.addWorkLog({
        issueId: id,
        worklog: worklog
    }, function(error, res) {
      callback(error,res);
    });
  },

  _deleteWorklog(id, issueId, callback) {
    this.jira.issue.deleteWorkLog({
      issueId: issueId,
      worklogId: id
    }, function(error, res) {
      callback(res);
    });
  },

  _updateWorklog(id, worklogId, worklog, callback) {
    this.jira.issue.updateWorkLog({
        issueId: id,
        worklogId: worklogId,
        worklog: worklog
    }, function(error, res) {
      callback(error,res);

    });
  },

  // Default to 1 day updated since, could potentially do something more robust here
  update( updatedSince, maxDate ){
    var self = this;
    /* ----- LEGACY CODE START -----

    if( !updatedSince ){
      updatedSince = moment.tz( Meteor.settings.timezone ).add( -14, 'days').toDate();
    }

    query = { date: {$gt: updatedSince} };

    if( maxDate  ){
      query.date['$lt'] = maxDate;
    }
    ----- LEGACY CODE END -----
    */


    //Get all timeEntries for a in harvest
    var timeEntries = TimeEntries.find().fetch();
  //  var timeEntries = TimeEntries.aggregate([{ $group: { _id: {jiraId: '$jiraId'} } }]);
    //Get all unique jira-issue-IDs from the timeEntries
    var jiraIds = _.unique( _.pluck(timeEntries, 'jiraId') );
    //Group all timeEntries by jira-issue-ID
    var timeEntriesGrouped = _.groupBy(timeEntries, 'jiraId');
    //Loop through each jira-ID
    _.each(jiraIds, function(id) {

      //Check if the id is a number, i.e. a jiraId
      if (id && (isNaN(id)) === false) {
        var worklogs = [];

        var future = new Future();
        //Get the worklog for the jira-issue-ID
        self._getAllWorklogs(id, function(wl) {
          future.return(wl.worklogs);
        });

        worklogs = future.wait();
        //Fetch harvest-IDs from worklogs
        var harvestIdsFromWorklogs = _.map(worklogs, function(wl) {
          var comment = wl.comment;
          var commentFragmented = comment.split(":");
          var id = parseInt(commentFragmented[0], 10);
          return id;
        });

        var harvestIdsFromTimeEntries = _.map(timeEntriesGrouped[id], function(te) {
          return te.harvestId;
        });

        var onlyInHarvest = _.difference(harvestIdsFromTimeEntries, harvestIdsFromWorklogs);
        var onlyInJira = _.difference(harvestIdsFromWorklogs, harvestIdsFromTimeEntries);
        var intersection = _.intersection(harvestIdsFromTimeEntries, harvestIdsFromWorklogs);

  /*     console.log(harvestIdsFromTimeEntries);
        console.log(harvestIdsFromWorklogs);
        console.log(intersection); */

        //If ID is in both harvest and jira --> Check for changes and UPDATE with harvest version if different
        _.each(intersection, function(id) {
          var timeEntry = _.find(timeEntries, function(te) {
            return parseInt(te.harvestId, 10) === id;
          });

          var worklog = _.find(worklogs, function(wl) {
            var comment = wl.comment;
            var commentFragmented = comment.split(":");
            return parseInt(commentFragmented[0], 10) === id;
          });

          var wlComparable = {
            comment: worklog.comment,
            timeSpentSeconds: worklog.timeSpentSeconds
          }

          var teComparable = {
            comment: timeEntry.harvestId+":"+timeEntry.comment,
            timeSpentSeconds: moment.duration(timeEntry.duration, 'hours').asSeconds()
          }

          var isEqual = _.isEqual(wlComparable, teComparable);

  /*        console.log(wlComparable);
          console.log(teComparable);
          console.log(isEqual); */

          if (isEqual === false) {
            self._updateWorklog(timeEntry.jiraId, worklog.id, teComparable, function(error, res) {
              console.log(error);
              console.log(res);
            });
          }

        });

        //If IDs only exist in jira --> DELETE
        if (onlyInJira.length > 0) {
          //Fetch harvest-IDs from worklogs

          _.each(worklogs, function(wl) {
            var comment = wl.comment;
            var commentFragmented = comment.split(":");
            var id = parseInt(commentFragmented[0], 10);

            if (_.contains(onlyInJira, id) === true) {
              self._deleteWorklog(wl.id, wl.issueId, function(res) {
                console.log(res);
              });
            }
          });
        } //end if

        //If IDs only exist in harvest --> INSERT
        if (onlyInHarvest.length > 0) {
          _.each(onlyInHarvest, function(id) {
            var timeEntry = _.find(timeEntries, function(te) {
              return parseInt(te.harvestId, 10) === id;
            });
            console.log(timeEntry);

            var wl = {
              "comment": timeEntry.harvestId+":"+timeEntry.comment,
              "timeSpentSeconds": moment.duration(timeEntry.duration, 'hours').asSeconds()
            //  "started": timeEntry.date
            }

            self._addWorklog(timeEntry.jiraId, wl, function(error, res) {
              console.log(error);
              console.log(res);
            });
          }); //end each
        } //end if
      }
    });


    /*
      Create a new harvest object from the harvest timeEntries.
      issueId,
      duration,
      comment
    */
  /*  var harvestObj = _.map(timeEntriesGrouped[id], function(entry) {
      return {
        issueId: entry.jiraId,
        duration: moment.duration(entry.duration, 'hours').asSeconds(),
        comment: entry.harvestId+":"+entry.comment
      }
    })*/
//    var comparableHarvestObj = _.sortBy(harvestObj, 'jiraId')

    /*
      Create a new jira object from the issue worklog
      issueId,
      duration,
      comment
    */
/*
    var jiraObj = _.map(worklogs.worklogs, function(wl) {
      return {
        issueId: wl.issueId,
        duration: wl.timeSpentSeconds,
        comment: wl.comment
      }
    });*/

  //  console.log("-----START-------");
//    console.log(harvestObj);
//    console.log("---------------");
//      console.log(jiraObj);
//      console.log("-----END-------");
    //console.log(timeEntriesGrouped);


/*
    var worklogs = [];

    //Loop over timeEntries
    _.each(timeEntries, function(entry) {
      if (entry.jiraId && (isNaN(entry.jiraId)) === false) {

      var future = new Future();
      //Get the worklog for issue related to the timeEntry.
      self._getAllWorklogs(entry.jiraId, function(worklogs) {
        future.return(worklogs);
      });

      worklogs = future.wait();

      var harvestIdsFromIssue = [];

      //Get harvest timeEntryId from the comment of all the worklogs
      if (worklogs && worklogs.worklogs) {

        _.each(worklogs.worklogs, function(worklog) {
          var comment = worklog.comment;
          var commentFragmented = comment.split(":");
          var id = parseInt(commentFragmented[0], 10);
          harvestIdsFromIssue.push(id);
        }); */

        /*
          If there exists a timeEntry that does not correspond to
           a timeEntryId from a worklog in jira → Insert new worklog
        */ /*
        var worklogExists = _.contains(harvestIdsFromIssue, entry.harvestId)
        if (worklogExists === false) {

          var wl = {
                "comment": entry.harvestId + ":" + entry.comment,
                "started": entry.date,
                "timeSpentSeconds": moment.duration(entry.duration, 'hours').asSeconds()
          }

          self._addWorklog(entry.jiraId, wl, function(res) {
            console.log(res);
          });


        }// end-if */
  //    }//end-if
//    } //end-if for filter out trelloIds
//  })//end-_.each
  }//end-update
}//end-JiraSync
