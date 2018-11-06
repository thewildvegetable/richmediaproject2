const models = require('../models');

const Deck = models.Deck;

const makeDeck = (req, res) => {
  if (!req.body.name || !req.body.cards) {  
    return res.status(400).json({ error: 'Name, age, and level are all required' });
  }
    
  //calculate # of cards in body.cards, if less than 60 (or when cmder is added, 100) send error back
    
  //if sideboard exists, make sure it is 15 or less cards
    
  //check that everything except basic lands and rat colony style cards have 4 or less cards in the deck (1 for cmder). Use SB in this check
 
  //check legality of cards in deck
    
  const deckData = {
    name: req.body.name,
    cards: req.body.cards,
    owner: req.session.account._id,
  };
    
    //if sideboard exists, add it
    

  const newDeck = new Deck.DeckModel(deckData);

  const deckPromise = newDeck.save();

  deckPromise.then(() => {
      
    res.json({ redirect: '/maker' });
  });

  deckPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Deck already exists' });
    }

    return res.status(400).json({ error: 'An error occurred' });
  });

  return deckPromise;
};

const makerPage = (req, res) => {
    return res.render('make', { csrfToken: req.csrfToken() });
};

const removerPage = (req, res) => {
  Deck.DeckModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('remove', { csrfToken: req.csrfToken(), decks: docs });
  });
};

const getDecksByOwner = (request, response) => {
  const req = request;
  const res = response;

  return Deck.DeckModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ decks: docs });
  });
};

const getDecks = (request, response) => {
  const req = request;
  const res = response;

  return Deck.DeckModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ decks: docs });
  });
};

const removeDeck = (request, response) => {
    const req = request;
    const res = response;
    
    return Deck.DeckModel.removeById(req.body._id, (err, docs) => {
        if (err) {
          console.log(err);
          return res.status(400).json({ error: 'An error occurred' });
        }

        return res.json({ decks: docs });
    });
};

module.exports.makerPage = makerPage;
module.exports.make = makeDeck;
module.exports.removerPage = removerPage;
module.exports.remove = removeDeck;
module.exports.getDecks = getDecks;
module.exports.getDecksByOwner = getDecksByOwner;