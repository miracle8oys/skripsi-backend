const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ProvinceSchema = new Schema({
  _id: ObjectId,
  province_name: String,
});

const Province = mongoose.model('Province', ProvinceSchema);
module.exports = Province;