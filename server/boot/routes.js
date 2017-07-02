module.exports = function(app) {

  // Ping Pong
  app.get('/api/ping', function(req, res) {
    res.send('pong');
  });

  // Returns the app version
  app.get('/api/app/settings', function(req, res) {
    const major = 0;
    const minor = 0;
    const patch = 3;
    const version = major + '.' + minor + '.' + patch;
    const store = {
      apple: 'itms-apps:itunes.apple.com/app/wordz/id1208567317'
    };

    const maintenance = {
      enable: false,
      message: 'Sorry, WordZ is down for maintenance for several minutes'
    };

    res.send({version, major, minor, patch, store, maintenance});
  });
}