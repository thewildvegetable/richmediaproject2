const models = require('../models');
const mtg = require('mtgsdk');
const query = require('querystring');
const url = require('url');

const Deck = models.Deck;

const PlaysetRule = {
  Commander: 1,
  Standard: 4,
  Modern: 4,
  Legacy: 4,
};  // the playset rule of all formats

const SizeRule = {
  Commander: 100,
  Standard: 60,
  Modern: 60,
  Legacy: 60,
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
};  // all the cards that can break the playset rule

const StandardLegalSets = {
  XLN: true,
  RIX: true,
  DOM: true,
  M19: true,
  GRN: true,
};  // all the standard legal sets 3 letter codes

// check that the list given fits all the rules
const checkRules = (req, res, cards, sideboard) => {
  // get the keys for main and sideboard
  const mainKeys = Object.keys(cards);
  const sideKeys = Object.keys(sideboard);

  for (let i = 0; i < mainKeys.length; i++) {
    const card = cards[mainKeys[i]];    // get the card
        // check the playset rule todo add handling of sideboard as well
    let numCopies = card.copies;
      // if its in the sideboard add the copies
    if (sideboard[card.name]) {
      numCopies += sideboard[card.name].copies;
    }

        // todo change from standard to req.body.format and to add the sideboard copies
    if (numCopies > PlaysetRule[req.body.format]) {
            // check that the card isnt 1 of the cards that ignore the playset rule
      if (!IgnorePlayset[card.name]) {
        let message = `Too many copies of ${card.name} and possibly`;
        message += ' other cards as well';
        return res.status(400).json({ error: message });
      }
    }

        // legality check here
    if (card.legalities) {
        // checker to verify the card has a legality ruling for the format
      let legalInFormat = false;
      for (let j = 0; j < card.legalities.length; j++) {
              // check that this entry is the format this deck is for
        if (card.legalities[j].format === req.body.format) {
          legalInFormat = true;

                  // check if the card is legal in this format
          if (card.legalities[j].legality !== 'Legal') {
            let message = `${card.name} is not legal in`;
            message += ` ${card.legalities[j].format}`;
            return res.status(400).json({ error: message });
          }
        }
      }
        // check that the format being checked for was found in
        // the legality list
      if (!legalInFormat) {
            // format wasn't found, check if its standard
        if (req.body.format === 'Standard') {
                // was the card printed in a standard legal set
          let standardLegal = false;
          for (let j = 0; j < card.printings.length; j++) {
            const printing = card.printings[j];
            if (StandardLegalSets[printing]) {
                        // card is legal, gtfo the loop
              standardLegal = true;
              break;
            }
          }
          if (!standardLegal) {
                    // card isnt legal
            let message = `${card.name} is not legal in`;
            message += ` ${req.body.format}`;
            return res.status(400).json({ error: message });
          }
        } else {
                // format isnt standard, so error
          let message = `${card.name} is not legal in`;
          message += ` ${req.body.format}`;
          return res.status(400).json({ error: message });
        }
      }
    }
      // if card.legalities doesnt exist, the card is standard legal
      // and thus legal everywhere
  }

    // sideboard check
  for (let i = 0; i < sideKeys.length; i++) {
    const card = sideboard[sideKeys[i]];    // get the card
        // check the playset rule todo add handling of sideboard as well
    const numCopies = card.copies;
        // todo change from standard to req.body.format and to add the sideboard copies
    if (numCopies > PlaysetRule.Standard) {
            // check that the card isnt 1 of the cards that ignore the playset rule
      if (!IgnorePlayset[card.name]) {
        let message = `Too many copies of ${card.name} in`;
        message += ' the sideboard and possibly other cards as well';
        return res.status(400).json({ error: message });
      }
    }

       // legality check here
    if (card.legalities) {
        // checker to verify the card has a legality ruling for the format
      let legalInFormat = false;
      for (let j = 0; j < card.legalities.length; j++) {
              // check that this entry is the format this deck is for
        if (card.legalities[j].format === req.body.format) {
            // set checker to true
          legalInFormat = true;
                  // check if the card is legal in this format
          if (card.legalities[j].legality !== 'Legal') {
            let message = `${card.name} is not legal in`;
            message += ` ${card.legalities[j].format}`;
            return res.status(400).json({ error: message });
          }
        }
      }
        // check that the format being checked for was found in
        // the legality list
      if (!legalInFormat) {
             // format wasn't found, check if its standard
        if (req.body.format === 'Standard') {
                // was the card printed in a standard legal set
          let standardLegal = false;
          for (let j = 0; j < card.printings.length; j++) {
            const printing = card.printings[j];
            if (StandardLegalSets[printing]) {
                        // card is legal, gtfo the loop
              standardLegal = true;
              break;
            }
          }
          if (!standardLegal) {
                    // card isnt legal
            let message = `${card.name} is not legal in`;
            message += ` ${req.body.format}`;
            return res.status(400).json({ error: message });
          }
        } else {
                // format isnt standard, so error
          let message = `${card.name} is not legal in`;
          message += ` ${req.body.format}`;
          return res.status(400).json({ error: message });
        }
      }
    }
      // if card.legalities doesnt exist, the card is standard legal
      // and thus legal everywhere
  }

  return true; // handling npm test error
};

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
  if (deckSize < SizeRule[req.body.format]) {
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
  if (checkRules(req, res, cards, sideboard) === true) {
    const deckData = {
      name: req.body.name,
      cards: JSON.stringify(cards),
      sideboard: JSON.stringify(sideboard),
      format: req.body.format,
      owner: req.session.account._id,
    };

    const newDeck = new Deck.DeckModel(deckData);

    const deckPromise = newDeck.save();

    deckPromise.then(() => {
      console.dir('deck added');
      res.json({ redirect: '/' });
    });

    deckPromise.catch((err) => {
      console.log(err);
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Deck already exists' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    });

    return deckPromise;
  }
  return 1;
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

    // if card name is a split card (ie name contains //)
    // get all cards and add the one with layout of split
  if (cardName.indexOf('//') !== -1) {
        // get front card
    const splitCardName = cardName.slice(0, cardName.indexOf('//')).trim();

        // search term
    const search = {
      name: splitCardName,
      page: 1,
      pageSize: 50,
      layout: 'split',
    };

        // search
    mtg.card.where(search).then(results => {
      let card = results[0];
              // check if multiverseid exists
      for (let j = 1; j < results.length; j++) {
                  // if the card has a multiverseid break out
        if (card.multiverseid) {
          break;
        }
                  // get next card
        card = results[j];
      }

            // make cardname the split card name
      card.name = cardName;

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
  } else {
    mtg.card.where({ name: cardName, page: 1, pageSize: 50 }).then(results => {
      let card = results[0];

          // check if multiverseid exists
      for (let j = 1; j < results.length; j++) {
              // if the card has a multiverseid break out
        if (card.multiverseid) {
            // make sure the card has the same name as the provided card name
          if (card.name.toLowerCase() === cardName.toLowerCase()) {
            break;
          }
        }
              // get next card
        card = results[j];
      }

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
  }
};

const getCards = (req, res) => {
    // check that a valid deckname and list are sent up todo add format
  if (!req.body.name || !req.body.deckList) {
    return res.status(400).json({ error: 'Name and decklist are both required' });
  }

    // parse out the maindeck
  const cards = req.body.deckList.split('\r\n');

    // parse out sideboard
  let sideboard = [];
  if (req.body.sideboard !== '') {
    sideboard = req.body.sideboard.split('\r\n');
  }

    // make sure no card is repeated in the mainboard. enforce playset rule
  for (let i = 0; i < cards.length; i++) {
    const index = cards[i].indexOf(' ');

    const cardName = cards[i].slice(index).trim();

        // if indexOf and LastIndexOf arent the same, there's a duplicate
    if (req.body.deckList.indexOf(cardName) !== req.body.deckList.lastIndexOf(cardName)) {
        // check to make sure its not a card with another card in its name
        // 2 spaces away in the string, aka what is a number if this is a repeat
      const start = req.body.deckList.lastIndexOf(cardName) - 2;
      const previousTwoChars = req.body.deckList.slice(start, start + 2);
      const isItANumber = parseInt(previousTwoChars, 10);
      if (isItANumber > 0) {
        let message = `${cardName} is present more than once in the decklist.`;
        message += ' Please combine it into 1 line';
        return res.status(400).json({ error: message });
      }
    }
  }
  const mainDeckSize = cards.length;    // last entry of the maindeck
  for (let i = 0; i < sideboard.length; i++) {
    const index = sideboard[i].indexOf(' ');

    const cardName = sideboard[i].slice(index).trim();

        // if indexOf and LastIndexOf arent the same, there's a duplicate
    if (req.body.sideboard.indexOf(cardName) !== req.body.sideboard.lastIndexOf(cardName)) {
      // check to make sure its not a card with another card in its name
        // 2 spaces away in the string, aka what is a number if this is a repeat
      const start = req.body.sideboard.lastIndexOf(cardName) - 2;
      const previousTwoChars = req.body.sideboard.slice(start, start + 2);
      const isItANumber = parseInt(previousTwoChars, 10);
      if (isItANumber > 0) {
        let message = `${cardName} is present more than once in the sideboard.`;
        message += ' Please combine it into 1 line';
        return res.status(400).json({ error: message });
      }
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

//edit the deck
const makeDeckEdit = (req, res, cards, sideboard, deckData, errors) => {
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
  if (deckSize < SizeRule[req.body.format]) {
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
  if (checkRules(req, res, cards, sideboard) === true) {
    let deck = deckData;
      
    deck.cards = JSON.stringify(cards),
    deck.sideboard = JSON.stringify(sideboard),

    const editDeckPromise = deck.save();

    editDeckPromise.then(() => {
      console.dir('deck edited');
      res.json({ redirect: '/' });
    });

    editDeckPromise.catch((err) => {
      console.log(err);
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Deck already exists' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    });

    return editDeckPromise;
  }
  return 1;
};

//find the cards for the edited deck
const cardSearchEdit = (req, res, iteration, cards, deck, sideboard, mainDeckSize, deckData, errors) => {
    // get the card
  const cardInfo = cards[iteration];
  const mainDeck = deck;
  const side = sideboard;
  let i = iteration;

    // seperate it into the # of copies and the name
  const cardName = cardInfo.slice(cardInfo.indexOf(' ')).trim();
  const numCopies = parseInt(cardInfo.split(' ', 1)[0], 10);

    // if card name is a split card (ie name contains //)
    // get all cards and add the one with layout of split
  if (cardName.indexOf('//') !== -1) {
        // get front card
    const splitCardName = cardName.slice(0, cardName.indexOf('//')).trim();

        // search term
    const search = {
      name: splitCardName,
      page: 1,
      pageSize: 50,
      layout: 'split',
    };

        // search
    mtg.card.where(search).then(results => {
      let card = results[0];
      // check if multiverseid exists
      for (let j = 1; j < results.length; j++) {
        // if the card has a multiverseid break out
        if (card.multiverseid) {
          break;
        }
        // get next card
        card = results[j];
      }

            // make cardname the split card name
      card.name = cardName;

      card.copies = numCopies;

            // if this iteration is still in the main deck
            // add it to the main deck, otherwise sideboard it
      if (i < mainDeckSize) {
        mainDeck[card.name] = card;
      } else {
        side[card.name] = card;
      }

      if (i >= cards.length - 1) {
        makeDeckEdit(req, res, mainDeck, side, deckData, errors);
      } else {
        i++;
        cardSearchEdit(req, res, i, cards, mainDeck, side, mainDeckSize, deckData, errors);
      }
    });
  } else {
    mtg.card.where({ name: cardName, page: 1, pageSize: 50 }).then(results => {
      let card = results[0];

          // check if multiverseid exists
      for (let j = 1; j < results.length; j++) {
              // if the card has a multiverseid break out
        if (card.multiverseid) {
            // make sure the card has the same name as the provided card name
          if (card.name.toLowerCase() === cardName.toLowerCase()) {
            break;
          }
        }
              // get next card
        card = results[j];
      }

      card.copies = numCopies;

        // if this iteration is still in the main deck
        // add it to the main deck, otherwise sideboard it
      if (i < mainDeckSize) {
        mainDeck[card.name] = card;
      } else {
        side[card.name] = card;
      }

      if (i >= cards.length - 1) {
        makeDeckEdit(req, res, mainDeck, side, deckData, errors);
      } else {
        i++;
        cardSearchEdit(req, res, i, cards, mainDeck, side, mainDeckSize, deckData, errors);
      }
    });

    mtg.card.where({ name: cardName, page: 1, pageSize: 50 }).catch((err) => {
      console.log(err);
      errors.push(cardName);
      if (i >= cards.length - 1) {
        makeDeckEdit(req, res, mainDeck, side, mainDeckSize, deckData, errors);
      } else {
        i++;
        cardSearchEdit(req, res, i, cards, mainDeck, side, mainDeckSize, deckData, errors);
      }
    });
  }
};

//get the deck object and the cards being added to it
const getCardsEdit = (req, res) => {
    // check that a valid deckname and list are sent up todo add format
  if (!req.body.deckList) {
    return res.status(400).json({ error: 'Decklist is required' });
  }
    
    //get the deck
    return Deck.DeckModel.findById(req.body.deckId, (err, deckData) => {
      if (err) {
        return res.status(400).json({ error: 'An error occurred' });
      }
        
      // parse out the maindeck
      const cards = req.body.deckList.split('\r\n');

      // parse out sideboard
      let sideboard = [];
      if (req.body.sideboard !== '') {
        sideboard = req.body.sideboard.split('\r\n');
      }

      // make sure no card is repeated in the mainboard. enforce playset rule
      for (let i = 0; i < cards.length; i++) {
        const index = cards[i].indexOf(' ');

        const cardName = cards[i].slice(index).trim();

        // if indexOf and LastIndexOf arent the same, there's a duplicate
        if (req.body.deckList.indexOf(cardName) !== req.body.deckList.lastIndexOf(cardName)) {
          // check to make sure its not a card with another card in its name
          // 2 spaces away in the string, aka what is a number if this is a repeat
          const start = req.body.deckList.lastIndexOf(cardName) - 2;
          const previousTwoChars = req.body.deckList.slice(start, start + 2);
          const isItANumber = parseInt(previousTwoChars, 10);
          if (isItANumber > 0) {
            let message = `${cardName} is present more than once in the decklist.`;
            message += ' Please combine it into 1 line';
            return res.status(400).json({ error: message });
          }
        }
      }
      const mainDeckSize = cards.length;    // last entry of the maindeck
      for (let i = 0; i < sideboard.length; i++) {
        const index = sideboard[i].indexOf(' ');

        const cardName = sideboard[i].slice(index).trim();

            // if indexOf and LastIndexOf arent the same, there's a duplicate
        if (req.body.sideboard.indexOf(cardName) !== req.body.sideboard.lastIndexOf(cardName)) {
          // check to make sure its not a card with another card in its name
            // 2 spaces away in the string, aka what is a number if this is a repeat
          const start = req.body.sideboard.lastIndexOf(cardName) - 2;
          const previousTwoChars = req.body.sideboard.slice(start, start + 2);
          const isItANumber = parseInt(previousTwoChars, 10);
          if (isItANumber > 0) {
            let message = `${cardName} is present more than once in the sideboard.`;
            message += ' Please combine it into 1 line';
            return res.status(400).json({ error: message });
          }
        }

        cards.push(sideboard[i]);
      }

        // the array to hold the jsons of the deck
      const deck = {};
      const sideboardList = {};

        // the array holding all card names that couldnt be found
      const errors = [];

        // call the recursive search function
      return cardSearchEdit(req, res, 0, cards, deck, sideboardList, mainDeckSize, deckData, errors);
    });
};

const makerPage = (req, res) => res.render('make', { csrfToken: req.csrfToken() });

const editPage = (req, res) => res.render('edit', { csrfToken: req.csrfToken() });

const removerPage = (req, res) => {
  Deck.DeckModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('remove', { csrfToken: req.csrfToken(), decks: docs });
  });
};

const getDeckById = (req, res) => {
    // parse the url
  const parsedUrl = url.parse(req.url);

  // grab the query parameters
  const params = query.parse(parsedUrl.query);

  Deck.DeckModel.findById(params._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ deck: docs });
  });
};

const viewDeckPage = (req, res) => res.render('view', { csrfToken: req.csrfToken() });

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

const getDecksByFormat = (req, res) => {
    // parse the url
  const parsedUrl = url.parse(req.url);

  // grab the query parameters
  const params = query.parse(parsedUrl.query);
  return Deck.DeckModel.findByFormat(params.format, (err, docs) => {
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
module.exports.editPage = makerPage;
module.exports.edit = getCardsEdit;
module.exports.viewDeckPage = viewDeckPage;
module.exports.removerPage = removerPage;
module.exports.remove = removeDeck;
module.exports.getDecks = getDecks;
module.exports.getDeckById = getDeckById;
module.exports.getDecksByOwner = getDecksByOwner;
module.exports.getDecksByFormat = getDecksByFormat;
