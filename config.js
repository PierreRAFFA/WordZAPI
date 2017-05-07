switch(process.env.NODE_ENV) {
  case 'development':
  default:
    wordzPurchase = '0.0.0.0:3020';
    break;

  case 'production':
    wordzPurchase = 'wordz-purchase:3020';
    break;
}

module.exports = {
  services: {
    wordzPurchase: wordzPurchase
  }
};