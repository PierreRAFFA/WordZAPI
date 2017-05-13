switch(process.env.NODE_ENV) {
  case 'local':
  default:
    wordzPurchase = '0.0.0.0:3010';
    break;

  case 'development':
  case 'production':
    wordzPurchase = 'wordz-purchase:3010';
    break;
}

module.exports = {
  services: {
    wordzPurchase: wordzPurchase
  }
};