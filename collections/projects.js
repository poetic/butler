// import { SimpleSchema } from 'meteor/aldeed:simple-schema';
Projects = new Mongo.Collection('projects', { idGeneration: 'MONGO' });


ProjectSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  harvestId: {
    type: Number,
    optional: true,
  },
});


Projects.attachSchema(ProjectSchema);
if (Meteor.isServer) {
  Projects._ensureIndex({ harvestId: 1 });
}
