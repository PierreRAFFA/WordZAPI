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
   * //Todo: specify the language as a parameter
   */
  User.top20 = function (cb) {

    const filters = {
      order: 'ranking',
      limit: 20,
    };

    return User.find(filters);

    // const filters = {
    //   include: {
    //     relation: 'identities',
    //     scope: {
    //       fields: ['profile'],
    //     }
    //   },
    //   order: 'statistics.en_GB.highestRankingScore DESC'
    // };
    // User.find.apply(this, [filters]).then( users => {
    //
    //   //add manually the rank to the user and avoid non-gamers such as admins
    //   var rank = 1;
    //   var userRanking = _.chain(users)
    //     .filter(user => user.__data.identities.length > 0)
    //     .map(user => {
    //       user.rank = rank++;
    //
    //       //Todo: tricky ?
    //       //pick only the photos properties, the rest should not be part of the result.
    //       user.__data.identities[0].__data.profile = _.pick(user.__data.identities[0].__data.profile, ['photos']);
    //
    //       return user;
    //     })
    //     .value();
    //
    //   cb(null, userRanking);
    // })
  };

  User.remoteMethod('top20', {
    http: {
      path: '/top20',
      verb: 'get'
    },
    returns: { arg: 'top20', type: 'array' }
  });

};





