const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getAds', mid.requiresSecure, controllers.Account.getAds);
  app.get('/getDecks', controllers.Deck.getDecks);
  app.get('/getDecksOwner', controllers.Deck.getDecksByOwner);
  app.get('/getDecksFormat', controllers.Deck.getDecksByFormat);
  app.get('/deck', mid.requiresSecure, controllers.Deck.viewDeckPage);
  app.get('/getDeck', controllers.Deck.getDeckById);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Deck.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Deck.make);
  app.get('/remove', mid.requiresLogin, controllers.Deck.removerPage);
  app.post('/remove', mid.requiresLogin, controllers.Deck.remove);
  app.get('/', mid.requiresSecure, controllers.Account.allDecksPage);
};

module.exports = router;
