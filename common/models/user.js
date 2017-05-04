'use strict';

const _ = require('lodash');
const request = require('request');

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
  User.top20 = function (cb) {

    const filters = {
      where: { email: { neq: 'admin@wordz.com' }},
      order: 'ranking',
      include: {
        relation: 'identities',
        scope: {
          fields: ['profile'],
        }
      },
      limit: 20,
    };

    return User.find(filters);
  };

  User.remoteMethod('top20', {
    http: {
      path: '/top20',
      verb: 'get'
    },
    returns: { arg: 'top20', type: 'array' }
  });
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
  User.purchase = function purchase(userId, receipt, sandbox, options, cb) {

    console.log('sandbox:' + sandbox);
    const {Store:store, TransactionID:transactionId, Payload: payload} = receipt;

    if (store && transactionId && payload) {

      const user = options.currentUser;

      //check if the transaction has been already registered
      const Purchase = User.app.models.Purchase;
      return Purchase.find({transactionId: transactionId}).then( purchases => {
        if ( purchases.length === 1){
          const error = new Error("The receipt has been already used");
          error.statusCode = 400;
          return cb(error);
        }else{

          //check if the receipt is valid
          return verifyAppleReceipt(payload, sandbox).then(storeResponse => {

            //save purchase and adjust the user
            if (storeResponse) {
              const productId = createPurchaseFromAppleReceipt(storeResponse, userId);
              user.balance += getCoinsFromProductId(productId);
              return user.save().then(() => {
                return user;
              });
            }else{
              const error = new Error("The receipt has not been validated by Apple");
              error.statusCode = 400;
              return cb(error);
            }
          });
        }
      });

    }else{
      const error = new Error("The receipt is not valid");
      error.statusCode = 400;
      return cb(error);
    }
  };

  User.remoteMethod('purchase', {
    http: {
      path: '/:id/purchase',
      verb: 'post'
    },
    accepts: [
      {arg: 'id', type: 'string', required: true},
      {arg: 'receipt', type: 'object', required: true},
      {arg: 'sandbox', type: 'boolean', required: false},
      {arg: "options", type: "object", http: "optionsFromRequest"}
    ],
    returns: { arg: "purchase", type: "array"}
  });

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  /**
   *
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
        defer.resolve(body);
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

      purchase.save();
      return inApp.product_id;
    }
  }


  function getCoinsFromProductId(productId) {
    switch(productId) {
      case 'com.wordz.game.coin1':
        return 16;
      case 'com.wordz.game.coin2':
        return 36;
      case 'com.wordz.game.coin3':
        return 95;
      case 'com.wordz.game.coin4':
        return 200;
      case 'com.wordz.game.coin5':
        return 420;
    }
  }

};

