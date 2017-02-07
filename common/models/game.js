'use strict';

module.exports = function(Game) {

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

    Game.on('dataSourceAttached', function(obj){
        var find = Game.find;
        Game.find = function(filter, cb) {
            return find.apply(this, arguments);
        };
    });

    /**
     * https://loopback.io/doc/en/lb3/Remote-methods.html
     */
    Game.top20 = function(cb) {
        Game.find.apply(this, [null, cb]);
    };

    Game.remoteMethod('top20', {
        http: {
            path: '/top20',
            verb: 'get'
        },
        returns: {arg: 'top20', type: 'array'}
    });

    
};
