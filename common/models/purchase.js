'use strict';

module.exports = function(Purchase) {

  /**
   * Define exposed methods (https://docs.strongloop.com/display/APIC/Operation+hooks)
   */
  Purchase.disableRemoteMethodByName('create');
  // Purchase.disableRemoteMethodByName('findById');
  // Purchase.disableRemoteMethodByName('find');
  Purchase.disableRemoteMethodByName('upsert');
  Purchase.disableRemoteMethodByName('updateAll');
  Purchase.disableRemoteMethodByName('exists');
  Purchase.disableRemoteMethodByName('findOne');
  Purchase.disableRemoteMethodByName('deleteById');
  Purchase.disableRemoteMethodByName('count');
  Purchase.disableRemoteMethodByName('replaceOrCreate');
  Purchase.disableRemoteMethodByName('createChangeStream');
  Purchase.disableRemoteMethodByName('replaceById');
  Purchase.disableRemoteMethodByName('upsertWithWhere');
  Purchase.disableRemoteMethodByName('prototype.patchAttributes');

};
