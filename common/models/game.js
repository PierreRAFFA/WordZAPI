'use strict';
var _ = require('lodash');

module.exports = function (Game) {

  /**
   * Define exposed methods (https://docs.strongloop.com/display/APIC/Operation+hooks)
   */

  // Game.disableRemoteMethodByName('create');
  // Game.disableRemoteMethodByName('findById');
  // Game.disableRemoteMethodByName('find');
  Game.disableRemoteMethodByName('upsert');
  Game.disableRemoteMethodByName('updateAll');
  Game.disableRemoteMethodByName('exists');
  Game.disableRemoteMethodByName('findOne');
  Game.disableRemoteMethodByName('deleteById');
  Game.disableRemoteMethodByName('count');
  Game.disableRemoteMethodByName('replaceOrCreate');
  Game.disableRemoteMethodByName('createChangeStream');
  Game.disableRemoteMethodByName('replaceById');
  Game.disableRemoteMethodByName('upsertWithWhere');
  Game.disableRemoteMethodByName('prototype.patchAttributes');

  /**
   * After save, update the user statistics
   */
  Game.observe('after save', function (ctx, next) {
    console.log('supports isNewInstance?', ctx.isNewInstance !== undefined);
    const game = ctx.instance;
    const userId = game.userId;
    const User = Game.app.models.user;
    User.findById(userId, {}, (error, user) => {
      if (error) {
        next(null);
      } else {

        //update the user statistics
        user.statistics.numGames = ++user.statistics.numGames || 1;
        user.statistics.totalRankingScore = user.statistics.totalRankingScore + game.score || game.score;
        user.statistics.highestRankingScore = Math.max(user.statistics.highestRankingScore, game.score) || game.score;
        user.statistics.averageRankingScore = user.statistics.totalRankingScore / user.statistics.numGames;

        if (game.statistics.highestScoringWordScore >= user.statistics.highestScoringWordScore) {
          user.statistics.highestScoringWord = game.statistics.highestScoringWord;
          user.statistics.highestScoringWordScore = game.statistics.highestScoringWordScore;
        }

        user.statistics.totalWordsPerMinute = user.statistics.totalWordsPerMinute + game.statistics.wordsPerMinute || game.statistics.wordsPerMinute;
        user.statistics.highestWordsPerMinute = Math.max(user.statistics.highestWordsPerMinute, game.statistics.wordsPerMinute) || game.statistics.wordsPerMinute;
        user.statistics.averageWordsPerMinute = user.statistics.totalWordsPerMinute / user.statistics.numGames;

        if (!user.statistics.longestWord || game.statistics.longestWord.length > user.statistics.longestWord.length) {
          user.statistics.longestWord = game.statistics.longestWord;
        }

        user.save().then(() => {
          next();
        });
      }
    });
  });

  /**
   * Find Games and include the user and userIdentity
   */
  Game.on('dataSourceAttached', function (obj) {
      var find = Game.find;
      Game.find = function (filter, token, cb) {

        filter = _.assign({}, filter, {
          fields: { statistics: false },
          include: {
            relation: 'user',
            scope: {
              fields: ['identities', 'username'],
              include: {
                relation: 'identities',
                scope: {
                  fields: ['profile'],
                }
              }
            },
          },
          order: 'creationDate DESC',
          limit: 15
        });

        find.apply(this, [filter]).then(games => {

          games = _.map(games, game => {
            if (game.__data.user) {
              //Todo tricky ?
              game.__data.user.__data.identities[0].__data.profile =
                _.pick(game.__data.user.__data.identities[0].__data.profile, ['photos']);
            }
            return game;
          });

          cb(null, games);
        });
      };
    }
  );
};
