Package.describe({
  name: 'poetic:harvest-local',
  version: '0.1.5-rc.1',
  summary: 'Packaged harvest plugin.',
  git: 'https://github.com/poetic/meteor-harvest.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.2');
  api.addFiles('harvest.js', 'server');

  api.export( 'Harvest','server' );
});

Npm.depends({harvest: '0.1.4'});
