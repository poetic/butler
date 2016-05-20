//import { SimpleSchema } from 'meteor/aldeed:simple-schema';
Projects = new Mongo.Collection('projects');

ProjectSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  }
});

Projects.attachSchema(ProjectSchema);
