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

        var languageStatistics;
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
          }
        },
        order: 'creationDate DESC',
        limit: 15
      });

      find.apply(this, [filter]).then(games => {
        games = _.map(games, game => {
          if (game.__data.user) {
            //Todo tricky ?
            game.serverDate = new Date().toISOString();
            game.__data.user.__data.identities[0].__data.profile =
              _.pick(game.__data.user.__data.identities[0].__data.profile, ['photos']);
          }
          return game;
        });

        cb(null, games);
      });
    };

    /**
     * Override the game creation and returns the up-to-date user statistics
     * @type {Game.create|*}
     */
    var create = Game.create;
    Game.create = function (data, options, cb) {
      create.apply(this, [data, options]).then( game => {
        game.user.getAsync().then( user => {
          cb(null, user);
        })
      });
    }
  });
};
