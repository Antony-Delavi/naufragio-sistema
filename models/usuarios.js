const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true},
}, { timestamps: true, collection: 'Usuarios' });

module.exports = mongoose.model('Users', UserSchema)