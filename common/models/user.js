'use strict';

const request = require('request');
const jwt = require('jsonwebtoken');

const get = require('lodash/get');
const map = require('lodash/map');
const assign = require('lodash/assign');
const omit = require('lodash/omit');
const pick = require('lodash/pick');

const config = require('../../config');

module.exports = function (User) {

  // var Languages = {
  //   en_GB: app.models.userStatistics,
  //   fr_FR: app.models.userStatistics
  // };
  User.disableRemoteMethodByName('login');
  User.disableRemoteMethodByName('reset');
  User.disableRemoteMethodByName('resetPassword');
  User.disableRemoteMethodByName('changePassword');
  User.disableRemoteMethodByName('setPassword');
  User.disableRemoteMethodByName('confirm');
  User.disableRemoteMethodByName('prototype.verify');

  User.disableRemoteMethodByName('create');
  // User.disableRemoteMethodByName('findById');
  User.disableRemoteMethodByName('find');
  User.disableRemoteMethodByName('upsert');
  // User.disableRemoteMethodByName('updateAll');
  User.disableRemoteMethodByName('exists');
  User.disableRemoteMethodByName('findOne');
  User.disableRemoteMethodByName('deleteById');
  User.disableRemoteMethodByName('count');
  User.disableRemoteMethodByName('replaceOrCreate');
  User.disableRemoteMethodByName('createChangeStream');
  User.disableRemoteMethodByName('replaceById');
  User.disableRemoteMethodByName('upsertWithWhere');
  // User.disableRemoteMethodByName('prototype.patchAttributes');

  //////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////// REMOTE METHODS


  ////////////////////////////////////////// LOGIN
  User.remoteMethod(
    'internalLogin',
    {
      description: 'Login a user with username/email and password.',
      accepts: [
        {arg: 'credentials', type: 'object', required: true, http: {source: 'body'}},
        {arg: 'include', type: ['string'], http: {source: 'query'},
          description: 'Related objects to include in the response. ' +
          'See the description of return value for more details.'},
      ],
      returns: {
        arg: 'accessToken', type: 'object', root: true,
        description: 'The response body contains properties of the {{AccessToken}} created on login.\n' +
            'Depending on the value of `include` parameter, the body may contain ' +
            'additional properties:\n\n' +
            '  - `user` - `U+007BUserU+007D` - Data of the currently logged in user. ' +
            '{{(`include=user`)}}\n\n',
      },
      http: {
        path: '/login',
        verb: 'post'
      },
    }
  );

  User.internalLogin = function(credentials, include) {
    let data = {};
    return User.login(credentials, include)
      .then(accessTokenModel => {
        data.accessToken = accessTokenModel.id;
        return accessTokenModel.user.getAsync();
      })
      .then(user => {
        data.user = user;
        return user;
      })
      .then(user => {
        return user.roles.getAsync().then(roles => {
          return roles;
        });
      })
      .then(roles => {
        data.roles = roles;
      })
      // .then(user => {
      //   return omit(user, ['balance', 'statistics']);
      // })
      .then(() => {
        const userJson = JSON.parse(JSON.stringify(data.user));
        userJson.roles = data.roles;

        return {
          jwt: 'Bearer ' + jwt.sign(userJson, process.env.JWT_SECRET, {
            expiresIn: 1440 // expires in 24 hours
          }),
          accessToken: data.accessToken
        };
      });
  };

  ////////////////////////////////////////// READ
  User.remoteMethod('read', {
    http: {
      path: '/',
      verb: 'get'
    },
    accepts: [
      {"arg": "filters", "type": "object"},
      {"arg": "options", "type": "object", "http": "optionsFromRequest"}
    ],
    returns: { arg:'user', type: [User], root: true }
  });

  User.read = function (filters, options) {
    console.log('read');
    console.log(filters);
    console.log(options);

    //is it me ?
    const currentUserId = get(options, 'currentUser.id');
    const isMe = currentUserId.toString() === get(filters, 'where.id');
    console.log('isMe:'  + isMe);

    const restrictedFields = {
      balance: false,
    };

    filters = assign({}, filters, {
      fields: isMe ? {} : restrictedFields,
      include: {
        relation: 'identities',
        scope: {
          fields: ['profile'],
        }
      },
    });

    //get users
    let users = User.find(filters)
      .filter(user => user.__data.identities.length > 0);


    if (isMe === false) {
      users = users.map(user => {
        user.__data.identities[0].__data.profile = pick(user.__data.identities[0].__data.profile, ['photos']);
        // delete user.__data.identities[0].__data.userId;
        return user;
      });
    }
    return users;
  };

  ////////////////////////////////////////// CONSUME GAME
  /**
   * Returns the top20
   * https://loopback.io/doc/en/lb3/Remote-methods.html
   * //Todo: specify the language as a parameter
   */
  User.remoteMethod('consumeGame', {
    http: {
      path: '/:id/consume-game',
      verb: 'post'
    },
    accepts: [
      {"arg": "id", "type": "string"},
      {"arg": "game", "type": "object"},
      {"arg": "options", "type": "object", "http": "optionsFromRequest"}
    ],
    returns: { type: User, root: true }
  });

  User.consumeGame = function (id, game, options, cb) {
    console.log(id);
    console.log(game);

    User.findById(id).then(user => {
      let languageStatistics;
      if (game.language in user.statistics === false) {
        user.statistics[game.language] = {};
      }
      languageStatistics = user.statistics[game.language];

      //update the user statistics
      languageStatistics.numGames = ++languageStatistics.numGames || 1;
      languageStatistics.totalRankingScore = languageStatistics.totalRankingScore + game.score || game.score;
      languageStatistics.highestRankingScore = Math.max(languageStatistics.highestRankingScore, game.score) || game.score;
      languageStatistics.averageRankingScore = languageStatistics.totalRankingScore / languageStatistics.numGames;

      if (!languageStatistics.highestScoringWordScore ||
        game.statistics.highestScoringWordScore >= languageStatistics.highestScoringWordScore) {
        languageStatistics.highestScoringWord = game.statistics.highestScoringWord;
        languageStatistics.highestScoringWordScore = game.statistics.highestScoringWordScore;
      }

      languageStatistics.totalWordsPerMinute = languageStatistics.totalWordsPerMinute + game.statistics.wordsPerMinute || game.statistics.wordsPerMinute;
      languageStatistics.highestWordsPerMinute = Math.max(languageStatistics.highestWordsPerMinute, game.statistics.wordsPerMinute) || game.statistics.wordsPerMinute;
      languageStatistics.averageWordsPerMinute = languageStatistics.totalWordsPerMinute / languageStatistics.numGames;

      if (!languageStatistics.longestWord ||
        game.statistics.longestWord.length > languageStatistics.longestWord.length) {
        languageStatistics.longestWord = game.statistics.longestWord;
      }

      //decrease balance
      user.balance -= 1;

      user.save().then(() => {
        cb(null, user);
      });
    });
  };

  ////////////////////////////////////////// TOP20
  /**
   * Returns the top20
   * https://loopback.io/doc/en/lb3/Remote-methods.html
   * //Todo: specify the language as a parameter
   */
  User.remoteMethod('top20', {
    http: {
      path: '/top20',
      verb: 'get'
    },
    returns: { type: 'array', root: true }
  });

  User.top20 = function () {

    const filters = {
      where: {'statistics.en_GB.ranking': { neq: null }},
      order: 'statistics.en_GB.ranking',
      include: {
        relation: 'identities',
        scope: {
          fields: ['profile'],
        }
      },
      limit: 20,
    };

    return User.find(filters)
    .filter(user => user.__data.identities.length > 0)
    .map(user => {

      //Todo: tricky ?
      //pick only the photos properties, the rest should not be part of the result.
      user.__data.identities[0].__data.profile = pick(user.__data.identities[0].__data.profile, ['photos']);

      return user;
    })
  };

  ////////////////////////////////////////// TOP100
  /**
   * Returns the top20
   * https://loopback.io/doc/en/lb3/Remote-methods.html
   * //Todo: specify the language as a parameter
   */
  User.remoteMethod('top100', {
    http: {
      path: '/top100',
      verb: 'get'
    },
    returns: { type: 'array', root: true }
  });

  User.top100 = function () {

    const filters = {
      where: {'statistics.en_GB.ranking': { neq: null }},
      order: 'statistics.en_GB.ranking',
      include: {
        relation: 'identities',
        scope: {
          fields: ['profile'],
        }
      },
      limit: 100,
    };

    return User.find(filters)
      .filter(user => user.__data.identities.length > 0)
      .map(user => {

        //Todo: tricky ?
        //pick only the photos properties, the rest should not be part of the result.
        user.__data.identities[0].__data.profile = pick(user.__data.identities[0].__data.profile, ['photos']);

        return user;
      })
  };

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////// OVERRIDE BUILT IN METHODS
};