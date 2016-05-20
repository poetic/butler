TaskSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true
  },
  billable: {
    type: Boolean,
    defaultValue: true,
    optional: true
  },
});

Tasks.attachSchema(TaskSchema);

Tasks.groupTimeEntriesByTask = timeEntries => {
  let timeEntriesByTaskId = _.groupBy(timeEntries, entry => entry.taskId);

  return Object.keys(timeEntriesByTaskId).map(taskId => {
    let timeEntriesForTask = timeEntriesByTaskId[taskId];

    return {
      taskName: Tasks.getName(taskId),
      duration: TimeEntries.getTotalDuration(timeEntriesForTask),
    };
  });
};

Tasks.getName = taskId => {
  return Tasks.findOne({_id: taskId}).name;
};

Tasks.getConcessedTaskIds = () => {
  return Tasks.find({name: {$regex: /concession/}}).map(task => task._id);
};
