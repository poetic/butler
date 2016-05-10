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


    /*
    * Get all timeEntries in harvest
    */
    var timeEntries = TimeEntries.find().fetch();
  /*  var test = TimeEntries.aggregate(
                                        { $group: {_id: '$jiraId',
                                            objects: {
                                              $push: {
                                                duration: '$duration', harvestId: '$harvestId', comment: '$comment'
                                              }
                                            }
                                          }
                                        }
                                    );
    console.log(test);*/

    /*
    * Get all unique jira-issue-IDs from the timeEntries
    */
    var jiraIds = _.unique( _.pluck(timeEntries, 'jiraId') );

    /*
    * Group all timeEntries by jira-issue-ID
    */
    var timeEntriesGrouped = _.groupBy(timeEntries, 'jiraId');
    //console.log(timeEntriesGrouped);

    /*
    * Loop through each jira-ID
    */
    _.each(jiraIds, function(id) {

      /*
      * Check if the id is a number, i.e. a jiraId
      */
      if (id && (isNaN(id)) === false) {
        var worklogs = [];
        var future = new Future();

        /*
        * Get the worklog for the jira-issue-ID
        */
        self._getAllWorklogs(id, function(wl) {
          future.return(wl.worklogs);
        });

        worklogs = future.wait();


        /*
        * Fetch harvest-IDs from worklogs
        */
        var harvestIdsFromWorklogs = _.map(worklogs, function(wl) {
          var comment = wl.comment;
          var commentFragmented = comment.split(":");
          var id = parseInt(commentFragmented[0], 10);
          return id;
        });

        var harvestIdsFromTimeEntries = _.map(timeEntriesGrouped[id], function(te) {
          return te.harvestId;
        });

        /*
        * onlyInHarvest: Harvest IDs that exist only in harvest
        * onlyInJira: Harvest IDs that exist only in jira worklogs
        * intersection: Harvest IDs that exist in both jira and harvest
        */
        var onlyInHarvest = _.difference(harvestIdsFromTimeEntries, harvestIdsFromWorklogs);
        var onlyInJira = _.difference(harvestIdsFromWorklogs, harvestIdsFromTimeEntries);
        var intersection = _.intersection(harvestIdsFromTimeEntries, harvestIdsFromWorklogs);

        /*
        * if ID is in both harvest and jira
        * check for changes and if they are different, an UPDATE has happened
        * replace jira version with harvest version
        */
        _.each(intersection, function(id) {
          var timeEntry = _.find(timeEntries, function(te) {
            return parseInt(te.harvestId, 10) === id;
          });

          var worklog = _.find(worklogs, function(wl) {
            var comment = wl.comment;
            var commentFragmented = comment.split(":");
            return parseInt(commentFragmented[0], 10) === id;
          });

          /*
          * Create comparable worklog object with fields that can be changed
          */
          var wlComparable = {
            comment: worklog.comment,
            timeSpentSeconds: worklog.timeSpentSeconds
          }

          /*
          * This conversion is necessary for rounding up harvest entries so they match jira.
          */
          var minutes = moment.duration(timeEntry.duration, 'hours').asMinutes();
          var minutesRound = Math.round(minutes);
          var seconds = moment.duration(minutesRound, 'minutes').asSeconds();

          /*
          * Create comparable timeEntry object with field that can be changed
          */
          var teComparable = {
            comment: timeEntry.harvestId+":"+timeEntry.comment,
            timeSpentSeconds: seconds
          }

          var isEqual = _.isEqual(wlComparable, teComparable);

          /*
          * if isEqual is false, an update has happened --> UPDATE
          */
          if (isEqual === false) {
            console.log(wlComparable);
            console.log(teComparable);

            self._updateWorklog(timeEntry.jiraId, worklog.id, teComparable, function(error, res) {
              if (error) {
                console.log(error);
              } else {
                console.log(res);
              }
            });
          }
        });

        /*
        * if ID only exist in jira --> DELETE
        */
        if (onlyInJira.length > 0) {

          /*
          * Fetch harvest-IDs from worklogs
          */
          _.each(worklogs, function(wl) {
            var comment = wl.comment;
            var commentFragmented = comment.split(":");
            var id = parseInt(commentFragmented[0], 10);

            if (_.contains(onlyInJira, id) === true) {
              self._deleteWorklog(wl.id, wl.issueId, function(res) {
                if (error) {
                  console.log(error);
                } else {
                  console.log(res);
                }
              });
            }
          });
        } //end if

        /*
        * if ID only exist in harvest --> INSERT
        */
        if (onlyInHarvest.length > 0) {
          _.each(onlyInHarvest, function(id) {
            var timeEntry = _.find(timeEntries, function(te) {
              return parseInt(te.harvestId, 10) === id;
            });

            var wl = {
              "comment": timeEntry.harvestId+":"+timeEntry.comment,
              "timeSpentSeconds": moment.duration(timeEntry.duration, 'hours').asSeconds()
            }
            self._addWorklog(timeEntry.jiraId, wl, function(error, res) {
              if (error) {
                console.log(error);
              } else {
                console.log(res);
              }
            });
          }); //end each
        } //end if
      } // end if
    }); // end each
  }//end-update
}//end-JiraSync
