var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var PoemSchema = new Schema({
  title: {
        type: String,
        required: true
    },
  body: {
        type: String,
        required: true
    },
  date: {
        type: Date,
        required: true 
        }
});

module.exports = mongoose.model('Poem', PoemSchema);