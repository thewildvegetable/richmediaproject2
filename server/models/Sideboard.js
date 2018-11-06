const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('underscore');

let SideBoardModel = {};

const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

const SideBoardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },

  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Deck',
  },
    
  cards: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Card',
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

SideBoardSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  cards: doc.cards,
});

SideBoardSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return SideBoardModel.find(search).select('name owner cards').exec(callback);
};

SideBoardSchema.statics.removeById = (sideboardId, callback) => {
  const search = {
    _id: convertId(sideboardId),
  };

  return SideBoardModel.remove(search).exec(callback);
};

SideBoardModel = mongoose.model('SideBoard', SideBoardSchema);

module.exports.SideBoardModel = SideBoardModel;
module.exports.SideBoardSchema = SideBoardSchema;
