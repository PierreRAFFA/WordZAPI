'use strict';

var _ = require('lodash');

module.exports = function (User) {

  // var Languages = {
  //   en_GB: app.models.userStatistics,
  //   fr_FR: app.models.userStatistics
  // };


  /**
   * Returns the top20
   * https://loopback.io/doc/en/lb3/Remote-methods.html
   */
  User.top20 = function (cb) {

    const filters = {
      include: {
        relation: 'identities',
        scope: {
          fields: ['profile'],
        }
      },
      order: 'statistics.highestRankingScore DESC'
    };
    User.find.apply(this, [filters]).then( users => {

      var rank = 1;
      users = _.map(users, user => {
        user.rank = rank++;

        //Todo tricky ?
        // user.__data.identities[0].__data.profile =
        //   _.pick(user.__data.identities[0].__data.profile, ['photos']);
        return user;
      });
      cb(null, users);
    })
  };

  User.remoteMethod('top20', {
    http: {
      path: '/top20',
      verb: 'get'
    },
    returns: { arg: 'top20', type: 'array' }
  });

};





