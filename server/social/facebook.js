const assign = require('lodash/assign');
const map = require('lodash/map');
const omit = require('lodash/omit');

module.exports = function (app, passport) {

  const User = app.models.user;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;
  const UserIdentity = app.models.userIdentity;
  const defaultPassword = process.env.API_FACEBOOK_USER_PASSWORD;

  app.post('/facebook/token',
    passport.authenticate('facebook-token'),
    function (req, res) {
      console.log(req.body);

      if (req.user) {

        //set created date and role to 'player' if new user
        if (!req.user.created) {
          req.user.created = new Date();
          req.user.save();

          console.log('this is a new player !!!');
          Role.find({where: {name: 'player'}}, function(err, roles) {
            if (err) {
              return console.log(err);
            }else if(roles.length === 1) {
              RoleMapping.create({
                principalType: "USER",
                principalId: req.user.id,
                roleId: roles[0].id
              }, function(err, roleMapping) {
                if (err) {return console.log(err);}
                console.log('User assigned RoleID "player"');
              });
            }
          });


        }

        //save firebase token if exists
        if ('firebase_token' in req.body) {
          req.user.firebaseToken = req.body.firebase_token;
          req.user.save();
        }

        const filters = {
          where: { userId: req.user.id }
        };

        UserIdentity.find(filters , function (error, userIdentities) {
          if (error) {
            res.status(500).send({statusCode: 500, message: 'No Profile Found'});
          } else {
            //return the user profile with identities
            const userJson = assign({}, JSON.parse(JSON.stringify(req.user)), {
              identities: JSON.parse(JSON.stringify(userIdentities))
            });

            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(userJson));
            res.end();
          }
        });
      } else {
        res.status(401).send({statusCode: 401, message: 'Authorization Required'});
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
    var generatedEmail = (profile.username || profile.id) + '@' +
      (profile.provider || provider) + 'lexiogame.com';
    var email = provider === 'ldap' ? profileEmail : generatedEmail;
    var username = profile.name.givenName + ' ' + profile.name.familyName.substr(0,1) + '.';
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

