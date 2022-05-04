const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
  user_id: ObjectId,
  username: String,
  password: String,
  company: String,
  date: Date
});

const User = mongoose.model('User', UserSchema);
module.exports = User;