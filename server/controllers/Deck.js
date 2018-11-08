const models = require('../models');
const mtg = require('mtgsdk');

const Deck = models.Deck;

/* const PlaysetRule = {
  Commander: 1,
  Standard: 4,
  Modern: 4,
  Legacy: 4,
  Vintage: 4,
};  // the playset rule of all formats

const IgnorePlayset = {
  Island: true,
  Mountain: true,
  Forest: true,
  Swamp: true,
  Plains: true,
  'Snow-Covered Mountain': true,
  'Snow-Covered Island': true,
  'Snow-Covered Forest': true,
  'Snow-Covered Swamp': true,
  'Snow-Covered Plains': true,
  'Relentless Rats': true,
  'Rat Colony': true,
  'Shadowborn Apostle': true,
};  // all the cards that can break the playset rule*/

const makeDeck = (req, res, cards, sideboard, errors) => {
  // if there are any errors, tell the user
  if (errors.length > 0) {
    let responseError = `The following cards could not be found: ${errors[0]}`;

    for (let i = 1; i < errors.length; i++) {
      responseError = `${responseError}; ${errors[i]}`;
    }

    return res.status(400).json({ error: responseError });
  }

  // calculate # of cards in body.cards,
  // if less than 60 (or when cmder is added, 100) send error back
  const deckKeys = Object.keys(cards);
  let deckSize = 0;
  for (let i = 0; i < deckKeys.length; i++) {
    deckSize += cards[deckKeys[i]].copies;
  }
  // todo change from 60 to a check if commander or not
  if (deckSize < 60) {
    return res.status(400).json({ error: 'Deck is too small' });
  }

  // if sideboard exists, make sure it is 15 or less cards
  const sideKeys = Object.keys(sideboard);
  let sideSize = 0;
  for (let i = 0; i < sideKeys.length; i++) {
    sideSize += sideboard[sideKeys[i]].copies;
  }
  if (sideSize > 15) {
    return res.status(400).json({ error: 'Sideboard must be 15 or less cards' });
  }

  // check that everything follows the rules
  // checkRules(req, res, cards, sideboard);

  const deckData = {
    name: req.body.name,
    cards: JSON.stringify(cards),
    sideboard: JSON.stringify(sideboard),
    format: 'Standard',
    owner: req.session.account._id,
  };// todo replace format with req.body.format

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

const cardSearch = (req, res, iteration, cards, deck, sideboard, mainDeckSize, errors) => {
    // get the card
  const cardInfo = cards[iteration];

  const mainDeck = deck;
  const side = sideboard;
  let i = iteration;

    // seperate it into the # of copies and the name
  const cardName = cardInfo.slice(cardInfo.indexOf(' ')).trim();
  const numCopies = parseInt(cardInfo.split(' ', 1)[0], 10);

  console.dir(cardName);

  mtg.card.where({ name: cardName, page: 1, pageSize: 50 }).then(results => {
    const card = results[0];
    card.copies = numCopies;

    // if this iteration is still in the main deck
    // add it to the main deck, otherwise sideboard it
    if (i < mainDeckSize) {
      mainDeck[card.name] = card;
    } else {
      side[card.name] = card;
    }

    if (i >= cards.length - 1) {
      makeDeck(req, res, mainDeck, side, errors);
    } else {
      i++;
      cardSearch(req, res, i, cards, mainDeck, side, mainDeckSize, errors);
    }
  });

  mtg.card.where({ name: cardName, page: 1, pageSize: 50 }).catch((err) => {
    console.log(err);
    errors.push(cardName);
    if (i >= cards.length - 1) {
      makeDeck(req, res, mainDeck, side, mainDeckSize, errors);
    } else {
      i++;
      cardSearch(req, res, i, cards, mainDeck, side, mainDeckSize, errors);
    }
  });
};

const getCards = (req, res) => {
    // check that a valid deckname and list are sent up todo add format
  if (!req.body.name || !req.body.deckList) {
    return res.status(400).json({ error: 'Name and decklist are both required' });
  }

    // parse out the maindeck
  const cards = req.body.deckList.split('\r\n');
    // console.dir(cards);

    // parse out sideboard
  let sideboard = [];
  if (req.body.sideboard !== '') {
    sideboard = req.body.deckList.split('\r\n');
  }

    // make sure no card is repeated in the mainboard. enforce playset rule
  for (let i = 0; i < cards.length; i++) {
    const index = cards[i].indexOf(' ');

    const cardName = cards[i].slice(index).trim();

        // if indexOf and LastIndexOf arent the same, there's a duplicate
    if (req.body.deckList.indexOf(cardName) !== req.body.deckList.lastIndexOf(cardName)) {
      let message = 'At least 1 card is present more than once in the decklist.';
      message += ' Please combine them into 1 line';
      return res.status(400).json({ error: message });
    }
  }
  const mainDeckSize = cards.length;    // last entry of the maindeck
  for (let i = 0; i < sideboard.length; i++) {
    const index = sideboard[i].indexOf(' ');

    const cardName = sideboard[i].slice(index).trim();

        // if indexOf and LastIndexOf arent the same, there's a duplicate
    if (req.body.sideboard.indexOf(cardName) !== req.body.sideboard.lastIndexOf(cardName)) {
      let message = 'At least 1 card is present more than once in the sideboard.';
      message += ' Please combine them into 1 line';
      return res.status(400).json({ error: message });
    }
    cards.push(sideboard[i]);
  }

    // the array to hold the jsons of the deck
  const deck = {};
  const sideboardList = {};

    // the array holding all card names that couldnt be found
  const errors = [];

    // call the recursive search function
  return cardSearch(req, res, 0, cards, deck, sideboardList, mainDeckSize, errors);
};

// check that the list given fits all the rules
/* const checkRules = (req, res, cards, sideboard) => {
    // get the card for npm test
  const cardInfo = cards[0];
  const cardName = cardInfo;    // replace with actual info later

  for (let i = 0; i < cards.length; i++) {
        // check the playset rule todo add handling of sideboard as well
    const numCopies = parseInt(cardInfo.split(' ', 1)[0], 10);
        // todo change from standard to req.body.format and to add the sideboard copies
    if (numCopies > PlaysetRule.Standard) {
            // check that the card isnt 1 of the cards that ignore the playset rule
      if (!IgnorePlayset[cardName]) {
        let message = `Too many copies of ${cardName} and possibly`;
        message += ' other cards as well';
        return res.status(400).json({ error: message });
      }
    }

        // legality check here
  }

  for (let i = 0; i < sideboard.length; i++) {
        // check the playset rule todo add handling of sideboard as well
    const numCopies = parseInt(cardInfo.split(' ', 1)[0], 10);
        // todo change from standard to req.body.format and to add the sideboard copies
    if (numCopies > PlaysetRule.Standard) {
            // check that the card isnt 1 of the cards that ignore the playset rule
      if (!IgnorePlayset[cardName]) {
        let message = `Too many copies of ${cardName} and possibly`;
        message += ' other cards as well';
        return res.status(400).json({ error: message });
      }
    }

        // legality check here
  }

  return 1; //handling npm test error
};*/

const makerPage = (req, res) => res.render('make', { csrfToken: req.csrfToken() });

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

const getDecksByFormat = (request, response) => {
  const req = request;
  const res = response;

  return Deck.DeckModel.findByFormat(req.body.format, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ decks: docs });
  });
};

const getDecks = (request, response) => {
  const res = response;

  return Deck.DeckModel.findAll((err, docs) => {
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
module.exports.make = getCards;
module.exports.removerPage = removerPage;
module.exports.remove = removeDeck;
module.exports.getDecks = getDecks;
module.exports.getDecksByOwner = getDecksByOwner;
module.exports.getDecksByFormat = getDecksByFormat;
