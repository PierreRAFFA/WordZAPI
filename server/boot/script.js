module.exports = function (app) {
  const User = app.models.user;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;

  RoleMapping.belongsTo(User);
  User.hasMany(RoleMapping, {foreignKey: 'principalId'});
  Role.hasMany(User, {through: RoleMapping, foreignKey: 'roleId'});

  // User.deleteAll();
  // Role.deleteAll();
  // return

  //Create admin and admin role
  User.find({ where: { username: 'Admin' } }, function (err, user) {

    if (err) {
      console.error(err);
    }else if (user.length === 0) {
      console.log('create admin with password:' + process.env.API_ADMIN_PASSWORD);
      User.create([
        { username: 'Admin', email: 'admin@lexiogame.com', password: process.env.API_ADMIN_PASSWORD },
      ], function (err, users) {
        if (err) {
          throw err;
        }

        //create the admin role
        Role.find({ where: { name: 'admin' } }, function (err, roles) {
          if (err) {
            console.error(err);
          }else if (roles.length === 1) {
            //make Admin an admin
            roles[0].principals.create({
              principalType: RoleMapping.USER,
              principalId: users[0].id
            }, function (err, principal) {
              if (err) {
                throw err;
              }

              console.log('Created principal:', principal);
            });
          }else if (roles.length === 0) {
            Role.create({
              name: 'admin'
            }, function (err, role) {
              if (err) {
                throw err;
              }

              console.log('Created role:', role);

              //make Admin an admin
              role.principals.create({
                principalType: RoleMapping.USER,
                principalId: users[0].id
              }, function (err, principal) {
                if (err) {
                  throw err;
                }

                console.log('Created principal:', principal);
              });
            });
          }
        });
      });
    }
  });

  //Create guest and guest role
  User.find({ where: { username: 'Guest' } }, function (err, user) {

    if (err) {
      console.error(err);
    }else if (user.length === 0) {
      User.create([
        { username: 'Guest', email: 'guest@lexiogame.com', password: 'password' },
      ], function (err, users) {
        if (err) {
          throw err;
        }

        //create the admin role
        Role.create({
          name: 'guest',
        }, function (err, role) {
          if (err) {
            throw err;
          }

          console.log('Created role:', role);

          //make Guest an guest
          role.principals.create({
            principalType: RoleMapping.USER,
            principalId: users[0].id
          }, function (err, principal) {
            if (err) {
              throw err;
            }

            console.log('Created principal:', principal);
          });
        });
      });
    }
  });

  //Create 'player' Role
  Role.find({ where: { name: 'player' } }, function (err, roles) {
    if (err) {
      console.error(err);
    }else if (roles.length === 0) {
      Role.create({
        name: 'player'
      }, function(err, role) {
        console.log('Created role:', role);
      });
    }
  });

  app.remotes().phases.addBefore('invoke', 'options-from-request').use(function (ctx, next) {
    if (!ctx.args.options || !ctx.args.options.accessToken) {
      return next();
    }
    const User = app.models.User;
    User.findById(ctx.args.options.accessToken.userId, function (err, user) {
      if (err) {
        return next(err);
      }
      ctx.args.options.currentUser = user;
      next();
    });
  });
};
