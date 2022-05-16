const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ResultSchema = new Schema({
  _id: ObjectId,
  user_id: String,
  result: Array,
  best_products: Array,
  itemset: Array,
  date: Date
});

const Result = mongoose.model('Result', ResultSchema);
module.exports = Result;