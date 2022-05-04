const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ResultSchema = new Schema({
  result_id: ObjectId,
  user_id: String,
  result: Array,
  date: Date
});

const Result = mongoose.model('Result', ResultSchema);
module.exports = Result;