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

HarvestSync.importAll(function() {
  JiraSync.update();
});
