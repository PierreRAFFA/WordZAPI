module.exports = function (app, passport) {

  const User = app.models.user;
  const UserIdentity = app.models.userIdentity;
  const defaultPassword = 'RTY-U39,30(§!fj-HD,JHJ-)*%DFJJhd-fhgdh,gf§5-D§5§6,-589Fj-hdjfd';

  app.post('/auth/facebook/token',
    passport.authenticate('facebook-token'),
    function (req, res) {
      console.log(req.body);

      if (req.user) {

        //set the default result
        var result = req.user;

        const UserIdentity = app.models.userIdentity;

        const filters = {
          where: { userId: req.user.id }
        };

        //get the user social profile
        UserIdentity.find(filters , function (error, userIndentities) {
          if (error) {
            res.send(500);
          } else {
            result.profile = userIndentities[0].profile;

            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(result));
            res.end();
          }
        });
      } else {
        res.send(401);
      }
    }
  );

  const FacebookTokenStrategy = require('passport-facebook-token');
  passport.use(new FacebookTokenStrategy({
    clientID: '1599447003703902',
    clientSecret: '6dd5a11669d7e479de22efd3e60f18b1'
  }, onSocialAuth));

  function onSocialAuth(accessToken, refreshToken, profile, done) {
    const credentials = {
      accessToken: accessToken,
      refreshToken: refreshToken
    };

    const options = {
      profileToUser: profileToUser
    };

    const callback = (err, user, identity, token) => {
      if (err) {
        done(err);
      }else{
        User.login({ email: user.email, password: defaultPassword }, function (err, accessToken) {
          console.log("accessToken after login:");

          // May be null if the user has just been created.
          // For now, I use token and not accessToken
          console.log(accessToken);

          user.accessToken = token.id;
          done(null, user);
        });
      }
    };

    //login user or create user / userIdentity / accessToken
    UserIdentity.login('facebook', 'oauth', profile, credentials, options, callback);
  }

  function profileToUser(provider, profile, options) {
    // Let's create a user for that
    var profileEmail = profile.emails && profile.emails[0] &&
      profile.emails[0].value;
    var generatedEmail = (profile.username || profile.id) + '@wordz.' +
      (profile.provider || provider) + '.com';
    var email = provider === 'ldap' ? profileEmail : generatedEmail;
    var username = provider + '.' + (profile.username || profile.id);
    var password = defaultPassword;
    var userObj = {
      username: username,
      password: password,
    };
    if (email) {
      userObj.email = email;
    }
    return userObj;
  }

};

