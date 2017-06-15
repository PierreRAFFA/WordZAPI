module.exports = function(app) {

  // Ping Pong
  app.get('/api/ping', function(req, res) {
    res.send('pong');
  });

  // Returns the app version
  app.get('/api/app/version', function(req, res) {
    const major = 1;
    const minor = 0;
    const patch = 0;
    const version = major + '.' + minor + '.' + patch;
    res.send({version, major, minor, patch});
  });
}