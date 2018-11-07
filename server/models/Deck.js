const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('underscore');

let DeckModel = {};

const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

const DeckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },

  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
    
  cards: {
    type: [String],
    required: true,
  },
    
  sideboard: {
    type: [String],
    required: false,
  },

  format: {
    type: String,
    required: false,
    trim: true,
    set: setName,
  },
    
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

DeckSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  cards: doc.cards,
  sideboard: doc.sideboard,
    format: doc.format,
});

DeckSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return DeckModel.find(search).select('name owner cards sideboard format').exec(callback);
};

DeckSchema.statics.findByFormat = (formatName, callback) => {
  const search = {
    format: formatName,
  };
    
  return DeckModel.find(search).select('name owner').exec(callback);
};

DeckSchema.statics.findAll = (callback) => {
  return DeckModel.find({}).select('name owner').exec(callback);
};

DeckSchema.statics.removeById = (deckId, callback) => {
  const search = {
    _id: convertId(deckId),
  };

    //TODO remove sideboard first
    
  return DeckModel.remove(search).exec(callback);
};

DeckModel = mongoose.model('Deck', DeckSchema);

module.exports.DeckModel = DeckModel;
module.exports.DeckSchema = DeckSchema;
