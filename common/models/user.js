'use strict';

const _ = require('lodash');
const request = require('request');

const config = require('../../config');

module.exports = function (User) {

  // var Languages = {
  //   en_GB: app.models.userStatistics,
  //   fr_FR: app.models.userStatistics
  // };
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
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
      user.__data.identities[0].__data.profile = _.pick(user.__data.identities[0].__data.profile, ['photos']);

      return user;
    })
  };

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
      user.__data.identities[0].__data.profile = _.pick(user.__data.identities[0].__data.profile, ['photos']);

      return user;
    })
  };

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  /**
   * User purchases a package
   * For more information for 'options' arg,
   *  see https://loopback.io/doc/en/lb3/Using-current-context.html#write-a-custom-remote-method-with-options
   *
   * @param userId
   * @param receipt
   * @param sandbox
   * @param options
   * @param cb
   */
  User.purchase = function purchase(userId, productId, receipt, sandbox, options, cb) {

    const user = options.currentUser;

    const url = 'http://' + config.services.wordzPurchase + '/api/purchases';

    const {Store:store, TransactionID:transactionId, Payload: payload} = receipt;

    const formFields = {
      userId,
      productId,
      store,
      sandbox,
      transactionId,
      payload
    };

    request.post({url: url, json: formFields}, (err, res, body) => {
      if (res.statusCode !== 200) {
        cb(body.error);
      }else{
        user.balance += body.update && body.update.balance ? body.update.balance : 0;
        return user.save().then(() => {
          cb(null, { balance: user.balance });
        });
      }
    });
  };

  User.remoteMethod('purchase', {
    http: {
      path: '/:id/purchase',
      verb: 'post'
    },
    accepts: [
      {arg: 'id', type: 'string', required: true},
      {arg: 'productId', type: 'string', required: true},
      {arg: 'receipt', type: 'object', required: true},
      {arg: 'sandbox', type: 'boolean', required: false},
      {arg: "options", type: "object", http: "optionsFromRequest"}
    ],
    returns: { arg: "purchase", type: "object"}
  });

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  /**
   * Call Apple endpoint to check receipt validity
   * @param payload
   * @param sandbox
   * @returns {*}
   */
  function verifyAppleReceipt(payload, sandbox) {

    const defer = Promise.defer();

    // determine which endpoint to use for verifying the receipt
    let endpoint = null;
    if (sandbox) {
      endpoint = 'https://sandbox.itunes.apple.com/verifyReceipt';
    } else {
      endpoint = 'https://buy.itunes.apple.com/verifyReceipt';
    }

    const formFields = {
      'receipt-data': payload
    };

    request.post({url: endpoint, json: formFields}, (err, res, body) => {
      console.log('Response:', body);

      if ('status' in body && body.status === 0) {

        //ignore valid receipts used for other bundles
        const bundleId =  _.get(body, 'receipt.bundle_id');
        if (bundleId && bundleId === 'com.wordz.game') {
          defer.resolve(body);
        }else{
          defer.resolve(null);
        }
      }else{
        defer.resolve(null);
      }
    });

    return defer.promise;
  }

  /**
   *
   * @param storeResponse
   * @param userId
   */
  function createPurchaseFromAppleReceipt(storeResponse, userId){

    console.log('==============================');
    console.log('createPurchaseFromAppleReceipt');
    console.log(userId);
    console.dir(storeResponse);
    if (storeResponse.receipt
      && storeResponse.receipt.in_app
      && storeResponse.receipt.in_app.length) {

      const inApp = storeResponse.receipt.in_app[0];

      const Purchase = User.app.models.Purchase;
      const purchase = new Purchase();
      purchase.transactionId = inApp.transaction_id;
      purchase.productId = inApp.product_id;
      purchase.response = storeResponse;
      purchase.userId = userId;
      purchase.store = 'apple';

      console.dir(purchase);
      console.log('==============================');
      return purchase.save();
    }
  }


  function getUserUpdateFromProductId(productId) {
    switch(productId) {
      case 'com.wordz.game.coin1':
        return { balance: 8 };
      case 'com.wordz.game.coin2':
        return { balance: 18 };
      case 'com.wordz.game.coin3':
        return { balance: 48 };
      case 'com.wordz.game.coin4':
        return { balance: 100 };
      case 'com.wordz.game.coin5':
        return { balance: 210 };
    }
  }

};

