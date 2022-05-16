const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const CitiesSchema = new Schema({
  _id: ObjectId,
  city_name: String,
});

const Cities = mongoose.model('Cities', CitiesSchema);
module.exports = Cities;