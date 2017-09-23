switch(process.env.NODE_ENV) {
  case 'local':
  default:
    lexioPurchase = '0.0.0.0:3010';
    break;

  case 'development':
  case 'production':
    lexioPurchase = 'lexio-purchase:3010';
    break;
}

module.exports = {
  services: {
    lexioPurchase: lexioPurchase
  }
};