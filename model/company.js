const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const CompanySchema = new Schema({
  _id: ObjectId,
  company_name: String,
  company_email: String,
  province_id: String,
  city_id: String,
  company_address: String
});

const Company = mongoose.model('Company', CompanySchema);
module.exports = Company;