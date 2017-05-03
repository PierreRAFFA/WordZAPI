// {"email":"admin@wordz.com", "password":"Test123"}
// {"email":"643152695835881@loopback.facebook.com", "password":"Test123"}

module.exports = function(app) {
    var User = app.models.user;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;
    
    User.find({ where: { username: 'Admin' }}, function(err, user) {
       if (user.length === 0) {
           User.create([
               {username: 'Admin', email: 'admin@wordz.com', password: 'Test123'},
           ], function(err, users) {
               if (err) throw err;

               console.log('Created users:', users);

               // create project 1 and make john the owner
               // users[0].projects.create({
               //     name: 'project1',
               //     balance: 100
               // }, function(err, project) {
               //     if (err) throw err;
               //
               //     console.log('Created project:', project);
               //
               //     // add team members
               //     Team.create([
               //         {ownerId: project.ownerId, memberId: users[0].id},
               //         {ownerId: project.ownerId, memberId: users[1].id}
               //     ], function(err, team) {
               //         if (err) throw err;
               //
               //         console.log('Created team:', team);
               //     });
               // });

               //create the admin role
               Role.create({
                   name: 'admin'
               }, function(err, role) {
                   if (err) throw err;

                   console.log('Created role:', role);

                   //make bob an admin
                   role.principals.create({
                       principalType: RoleMapping.USER,
                       principalId: users[0].id
                   }, function(err, principal) {
                       if (err) throw err;

                       console.log('Created principal:', principal);
                   });
               });
           });
       }
    });


    app.remotes().phases
    .addBefore('invoke', 'options-from-request')
    .use(function(ctx, next) {
        if (!ctx.args.options.accessToken) return next();
        const User = app.models.User;
        User.findById(ctx.args.options.accessToken.userId, function(err, user) {
            if (err) return next(err);
            ctx.args.options.currentUser = user;
            next();
        });
    });
};
