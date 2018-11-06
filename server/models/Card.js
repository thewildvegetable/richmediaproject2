const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('underscore');

let CardModel = {};

const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

const CardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
    
  multiverseId: {
    type: Number,
    min: 0,
    required: true,
  },
    
  legalities: {
    type: [String],
    required: true,
  },
    
  types: {
    type: [String],
    required: true,
  },
});

CardSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  multiverseId: doc.multiverseId,
  legalities: doc.legalities,
  types: doc.types,
});

CardSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return CardModel.find(search).select('name multiverseId legalities types').exec(callback);
};

CardModel = mongoose.model('Card', CardSchema);

module.exports.CardModel = CardModel;
module.exports.CardSchema = CardSchema;
