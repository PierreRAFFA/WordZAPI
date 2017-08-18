'use strict';
module.exports = {
  db: {
    name: 'db',
    connector: 'mongodb',
    host: 'mongohost',
    port: 27017,
    url: '',
    database: 'authentication',
    user: 'api',
    password: process.env.MONGO_API_PASSWORD,
  },
}
