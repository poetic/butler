// import { SimpleSchema } from 'meteor/aldeed:simple-schema';
TimeEntries = new Mongo.Collection('timeEntries', { idGeneration: 'MONGO' });

TimeEntrySchema = new SimpleSchema({
  duration: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    optional: true,
  },
  date: {
    type: Date,
    optional: true,
  },
  userId: {
    type: SimpleSchema.RegEx.id,
    optional: true,
  },
  projectId: {
    type: SimpleSchema.RegEx.id,
    optional: true,
  },
  taskId: {
    type: SimpleSchema.RegEx.id,
    optional: true,
  },
  notes: {
    type: String,
    optional: true,
  },
  harvestId: {
    type: Number,
    optional: true,
  },
  harvestTrelloCardName: { // Used for trello title recovery. Probably can be removed
    type: String,
    optional: true,
  },
  jiraId: {
    type: String,
    optional: true,
  },
  trelloId: {
    type: String,
    optional: true,
  },
});

TimeEntries.attachSchema(TimeEntrySchema);
if (Meteor.isServer) {
  TimeEntries._ensureIndex({ harvestId: 1 });
}
TimeEntries.attachBehaviour('timestampable');

TimeEntries.helpers({
  taskName() {
    return Tasks.findOne(this.taskId).name;
  },
});


TimeEntries.getTotalDuration = timeEntries => {
  let durations = _.compact(_.pluck(timeEntries, 'duration'));

  return durations.reduce((previous, current) => {
    return previous + current;
  }, 0);
};
