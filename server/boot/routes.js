'use strict';
const request = require('request');
const jwt = require('jsonwebtoken');

module.exports = function(app) {

  //////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////// Defines here all the service routes
  // const authenticateUser = (req, res, next) => {
  //   req.user = null;
  //
  //   const AccessToken = app.models.AccessToken;
  //   const User = app.models.User;
  //
  //   const accessToken = req.query.access_token;
  //   if (accessToken) {
  //     AccessToken.findById(accessToken, (err, accessToken) => {
  //       if (err) {
  //         next(err);
  //       }else{
  //         if(accessToken) {
  //           User.findById(accessToken.userId, { include: "roles" }, (err, user) => {
  //             if (err) {
  //               next(err);
  //             }else{
  //               req.user = user;
  //               next();
  //             }
  //           });
  //         }else{
  //           const error = new Error('Not Authorized');
  //           error.statusCode = 401;
  //           next(error);
  //         }
  //       }
  //     });
  //   }else{
  //     next();
  //   }
  // };
  //
  // ////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////  GET
  // app.get('/api/v:version/service-:service/(*)', authenticateUser, (req, res) => {
  //   console.log(req.user);
  //   const host = `wordz-${req.params.service}`;
  //
  //   let options = {
  //     url: `http://${host}:3010/api/${req.params['0']}`,
  //     headers: {},
  //   };
  //
  //   // if user is found and password is right
  //   // create a token
  //   if (req.user) {
  //     const token = 'Bearer ' + jwt.sign(JSON.parse(JSON.stringify(req.user)), process.env.JWT_SECRET, {
  //       expiresIn: 1440 // expires in 24 hours
  //     });
  //
  //     options.headers.Authorization = token;
  //   }
  //
  //   console.log(options.headers);
  //
  //   return request(options, (error, response, body) => {
  //     if (error) {
  //       res.send(error);
  //     }else{
  //       res.send(body);
  //     }
  //   });
  // });
  //
  // ////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////  POST
  // app.post('/api/v:version/service-:service/(*)', authenticateUser, (req, res) => {
  //   console.log(req.body);
  //   const host = `wordz-${req.params.service}`;
  //
  //   let options = {
  //     url: `http://${host}:3010/api/${req.params['0']}`,
  //     headers: {},
  //     form: req.body
  //   };
  //
  //   // if user is found and password is right
  //   // create a token
  //   if (req.user) {
  //     const token = 'Bearer ' + jwt.sign(JSON.parse(JSON.stringify(req.user)), process.env.JWT_SECRET, {
  //         expiresIn: 1440 // expires in 24 hours
  //     });
  //
  //     options.headers.Authorization = token;
  //   }
  //
  //   console.log(options.headers);
  //
  //   return request.post(options, (error, response, body) => {
  //     if (error) {
  //       res.send(error);
  //     }else{
  //       res.send(body);
  //     }
  //   })
  // });

  //////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////// Defines here all the custom routes and the service routes

  // Ping Pong
  app.get('/api/ping', function(req, res) {
    res.send('pong');
  });

};
