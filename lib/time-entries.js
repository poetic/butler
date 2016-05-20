//import { SimpleSchema } from 'meteor/aldeed:simple-schema';

TimeEntrySchema = new SimpleSchema({
  duration: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    optional: true
  },
  date: {
    type: Date,
    optional: true
  },
  userId: {
    type: SimpleSchema.RegEx.id,
    optional: true
  },
  projectId: {
    type: SimpleSchema.RegEx.id,
    optional: true
  },
  taskId: {
    type: SimpleSchema.RegEx.id,
    optional: true
  },
  notes: {
    type: String,
    optional: true
  }
});

TimeEntries.attachSchema( TimeEntrySchema );
TimeEntries.attachBehaviour('timestampable');

TimeEntries.helpers({
  taskName (){
    return Tasks.findOne(this.taskId).name;
  },
});

TimeEntries.getTotalDuration = timeEntries => {
  let durations = _.compact(_.pluck(timeEntries, 'duration'));

  return durations.reduce((previous, current) => {
    return previous + current;
  }, 0);
};
