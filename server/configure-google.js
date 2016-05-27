import { Meteor } from 'meteor/meteor';

const { google } = Meteor.settings.private;

const configure = () => {
  if (google) {
    ServiceConfiguration.configurations.upsert(
      { service: 'google' },
      { $set: {
        clientId: google.clientId,
        secret: google.secret,
      } }
    );
  }
};

export default configure;
